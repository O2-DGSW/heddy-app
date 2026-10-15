import UIKit
import Capacitor
import AVFoundation

class ViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(ArServerHttpPlugin())
        bridge?.registerPluginInstance(CameraPermissionPlugin())
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        // WKWebView의 네이티브 스크롤뷰는 우리 CSS(overflow, overscroll-behavior)와
        // 무관하게 자체적으로 bounce된다. 이걸 꺼야 body가 안전영역 밖으로 튕기며
        // 상단에 컴포넌트가 노출되는 현상이 사라진다.
        webView?.scrollView.bounces = false

        // WKWebView는 배경색을 명시하지 않으면 기본값이 검정이라, CSS로 둥글게 깎은
        // 모서리(navbar 라운딩 등)의 빈 픽셀이나 페이지 로드 전 틈에서 검정이 잠깐
        // 비친다. 앱 배경과 같은 흰색으로 맞춰 그 틈에서도 색이 어긋나지 않게 한다.
        view.backgroundColor = .white
        webView?.isOpaque = false
        webView?.backgroundColor = .white
        webView?.scrollView.backgroundColor = .white
    }
}

/// 카메라 권한을 앱 시작이 아니라 AR 화면에 들어갈 때 웹에서 요청하도록 연결한다.
/// 이미 정해진 권한이면 시스템 창 없이 현재 상태만 돌려준다.
@objc(CameraPermissionPlugin)
public class CameraPermissionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CameraPermissionPlugin"
    public let jsName = "CameraPermission"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "request", returnType: CAPPluginReturnPromise),
    ]

    @objc func request(_ call: CAPPluginCall) {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            call.resolve(["granted": granted])
        }
    }
}
