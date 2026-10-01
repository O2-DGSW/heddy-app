import Capacitor
import Foundation
import Security

@objc(ArServerHttpPlugin)
public class ArServerHttpPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ArServerHttpPlugin"
    public let jsName = "CapacitorHttp"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "request", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "post", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "put", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "patch", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "delete", returnType: CAPPluginReturnPromise)
    ]

    @objc func request(_ call: CAPPluginCall) { performRequest(call, method: nil) }
    @objc func get(_ call: CAPPluginCall) { performRequest(call, method: "GET") }
    @objc func post(_ call: CAPPluginCall) { performRequest(call, method: "POST") }
    @objc func put(_ call: CAPPluginCall) { performRequest(call, method: "PUT") }
    @objc func patch(_ call: CAPPluginCall) { performRequest(call, method: "PATCH") }
    @objc func delete(_ call: CAPPluginCall) { performRequest(call, method: "DELETE") }

    private func performRequest(_ call: CAPPluginCall, method: String?) {
        do {
            guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
                throw URLError(.badURL)
            }
            guard let trust = getConfig().getObject("arServerTrust"),
                  let originString = trust["origin"] as? String,
                  let origin = URL(string: originString),
                  url.scheme == "https", url.host == origin.host,
                  (url.port ?? 443) == (origin.port ?? 443) else {
                try HttpRequestHandler.request(call, method, bridge?.config)
                return
            }
            guard let encoded = trust["certificate"] as? String,
                  let certificateData = Data(base64Encoded: encoded),
                  let certificate = SecCertificateCreateWithData(nil, certificateData as CFData),
                  let validFrom = trust["validFrom"] as? Double,
                  let validUntil = trust["validUntil"] as? Double else {
                throw URLError(.serverCertificateUntrusted)
            }
            let delegate = ArServerTrustDelegate(
                origin: origin, certificate: certificate, certificateData: certificateData,
                validFrom: validFrom, validUntil: validUntil
            )
            let request = try HttpRequestHandler.CapacitorHttpRequestBuilder()
                .setUrl(urlString)
                .setMethod(method ?? call.getString("method", "GET"))
                .setUrlParams(call.getObject("params") ?? [:], call.getBool("shouldEncodeUrlParams", true))
                .openConnection()
                .build()
            request.setRequestHeaders(call.getObject("headers") ?? [:])
            request.setTimeout((call.getDouble("connectTimeout") ?? call.getDouble("readTimeout") ?? 10000) / 1000)
            if let data = call.options["data"] as? JSValue {
                try request.setRequestBody(data, call.getString("dataType", "any"))
            }
            let session = URLSession(configuration: .ephemeral, delegate: delegate, delegateQueue: nil)
            let task = session.dataTask(with: request.getUrlRequest()) { [weak self] data, response, error in
                defer { session.finishTasksAndInvalidate() }
                if let error = error {
                    call.reject(error.localizedDescription, (error as NSError).domain, error)
                    return
                }
                guard let response = response as? HTTPURLResponse else {
                    call.reject("AR 서버가 HTTP 응답을 반환하지 않았습니다.")
                    return
                }
                HttpRequestHandler.setCookiesFromResponse(response, self?.bridge?.config)
                let type = ResponseType(rawValue: call.getString("responseType", "text")) ?? .default
                call.resolve(HttpRequestHandler.buildResponse(data, response, responseType: type))
            }
            task.resume()
        } catch {
            call.reject(error.localizedDescription, (error as NSError).domain, error)
        }
    }
}

private final class ArServerTrustDelegate: NSObject, URLSessionDelegate, URLSessionTaskDelegate {
    private let origin: URL
    private let certificate: SecCertificate
    private let certificateData: Data
    private let validFrom: Double
    private let validUntil: Double

    init(origin: URL, certificate: SecCertificate, certificateData: Data, validFrom: Double, validUntil: Double) {
        self.origin = origin
        self.certificate = certificate
        self.certificateData = certificateData
        self.validFrom = validFrom
        self.validUntil = validUntil
    }

    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge,
                    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust else {
            completionHandler(.performDefaultHandling, nil)
            return
        }
        let now = Date().timeIntervalSince1970
        guard now >= validFrom, now < validUntil,
              challenge.protectionSpace.host == origin.host,
              challenge.protectionSpace.port == (origin.port ?? 443),
              let trust = challenge.protectionSpace.serverTrust,
              let certificates = SecTrustCopyCertificateChain(trust) as? [SecCertificate],
              let serverCertificate = certificates.first,
              SecCertificateCopyData(serverCertificate) as Data == certificateData else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        // 승인된 인증서를 신뢰 앵커로 한정해 호스트 이름·서명 검증을 함께 수행한다.
        let policy = SecPolicyCreateSSL(true, challenge.protectionSpace.host as CFString)
        guard SecTrustSetPolicies(trust, policy) == errSecSuccess,
              SecTrustSetAnchorCertificates(trust, [certificate] as CFArray) == errSecSuccess,
              SecTrustSetAnchorCertificatesOnly(trust, true) == errSecSuccess,
              SecTrustEvaluateWithError(trust, nil) else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        completionHandler(.useCredential, URLCredential(trust: trust))
    }

    func urlSession(_ session: URLSession, task: URLSessionTask,
                    willPerformHTTPRedirection response: HTTPURLResponse, newRequest request: URLRequest,
                    completionHandler: @escaping (URLRequest?) -> Void) {
        // 고정한 서버의 요청이 리다이렉트로 다른 서버에 전달되지 않도록 한다.
        completionHandler(nil)
    }
}
