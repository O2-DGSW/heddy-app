package site.heddy.app;

import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSValue;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.plugin.CapacitorHttp;
import com.getcapacitor.plugin.util.CapacitorHttpUrlConnection;
import com.getcapacitor.plugin.util.HttpRequestHandler;
import java.io.ByteArrayInputStream;
import java.net.URL;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import org.json.JSONObject;

@CapacitorPlugin(name = "CapacitorHttp")
public class ArServerHttpPlugin extends CapacitorHttp {
    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    private final Map<PluginCall, HttpsURLConnection> connections = new ConcurrentHashMap<>();

    @Override
    @PluginMethod
    public void request(PluginCall call) {
        JSONObject trust = getConfig().getObject("arServerTrust");
        try {
            URL url = new URL(call.getString("url", ""));
            if (trust == null || !sameOrigin(url, new URL(trust.getString("origin")))) {
                super.request(call);
                return;
            }
            executor.submit(() -> {
                try {
                    call.resolve(requestWithCertificate(call, url, trust));
                } catch (Exception error) {
                    call.reject(error.getLocalizedMessage(), error.getClass().getSimpleName(), error);
                } finally {
                    HttpsURLConnection connection = connections.remove(call);
                    if (connection != null) connection.disconnect();
                }
            });
        } catch (Exception error) {
            call.reject(error.getLocalizedMessage(), error.getClass().getSimpleName(), error);
        }
    }

    private static boolean sameOrigin(URL url, URL origin) {
        int port = url.getPort() == -1 ? url.getDefaultPort() : url.getPort();
        int originPort = origin.getPort() == -1 ? origin.getDefaultPort() : origin.getPort();
        return "https".equals(url.getProtocol()) && url.getHost().equalsIgnoreCase(origin.getHost()) && port == originPort;
    }

    private JSObject requestWithCertificate(PluginCall call, URL url, JSONObject trust) throws Exception {
        byte[] certificateData = Base64.decode(trust.getString("certificate"), Base64.DEFAULT);
        X509Certificate certificate = (X509Certificate) CertificateFactory.getInstance("X.509")
            .generateCertificate(new ByteArrayInputStream(certificateData));
        certificate.checkValidity();
        KeyStore anchors = KeyStore.getInstance(KeyStore.getDefaultType());
        anchors.load(null, null);
        anchors.setCertificateEntry("ar-server", certificate);
        TrustManagerFactory factory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        factory.init(anchors);
        X509TrustManager anchorTrust = null;
        for (TrustManager manager : factory.getTrustManagers()) {
            if (manager instanceof X509TrustManager) anchorTrust = (X509TrustManager) manager;
        }
        if (anchorTrust == null) throw new CertificateException("AR 서버 인증서 검증기를 생성하지 못했습니다.");
        X509TrustManager delegate = anchorTrust;
        X509TrustManager pinnedTrust = new X509TrustManager() {
            @Override
            public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                certificate.checkValidity();
                if (chain.length == 0 || !Arrays.equals(chain[0].getEncoded(), certificateData)) {
                    throw new CertificateException("AR 서버 인증서가 승인된 인증서와 다릅니다.");
                }
                delegate.checkServerTrusted(chain, authType);
            }

            @Override
            public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                throw new CertificateException("클라이언트 인증서 인증은 지원하지 않습니다.");
            }

            @Override
            public X509Certificate[] getAcceptedIssuers() {
                return delegate.getAcceptedIssuers();
            }
        };
        SSLContext context = SSLContext.getInstance("TLS");
        context.init(null, new TrustManager[] { pinnedTrust }, null);

        String method = call.getString("method", "GET").toUpperCase(Locale.ROOT);
        CapacitorHttpUrlConnection wrapped = new HttpRequestHandler.HttpURLConnectionBuilder()
            .setUrl(url)
            .setMethod(method)
            .setHeaders(call.getObject("headers", new JSObject()))
            .setUrlParams(call.getObject("params", new JSObject()), call.getBoolean("shouldEncodeUrlParams", true))
            .setConnectTimeout(call.getInt("connectTimeout", 10000))
            .setReadTimeout(call.getInt("readTimeout", 10000))
            .setDisableRedirects(true)
            .openConnection()
            .build();
        HttpsURLConnection connection = (HttpsURLConnection) wrapped.getHttpConnection();
        connections.put(call, connection);
        // 연결마다 신뢰 범위를 제한하고 기본 호스트 이름 검증을 유지한다.
        connection.setSSLSocketFactory(context.getSocketFactory());
        if (!method.equals("GET") && !method.equals("HEAD") && call.getData().has("data")) {
            wrapped.setDoOutput(true);
            wrapped.setRequestBody(call, new JSValue(call, "data"), call.getString("dataType"));
        }
        wrapped.connect();
        return HttpRequestHandler.buildResponse(wrapped, HttpRequestHandler.ResponseType.parse(call.getString("responseType")));
    }

    @Override
    protected void handleOnDestroy() {
        executor.shutdownNow();
        for (Map.Entry<PluginCall, HttpsURLConnection> entry : connections.entrySet()) {
            entry.getValue().disconnect();
            getBridge().releaseCall(entry.getKey());
        }
        connections.clear();
        super.handleOnDestroy();
    }
}
