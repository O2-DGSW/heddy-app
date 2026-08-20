import UIKit
import Capacitor
import AVFoundation

class ViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        // WKWebView의 네이티브 스크롤뷰는 우리 CSS(overflow, overscroll-behavior)와
        // 무관하게 자체적으로 bounce된다. 이걸 꺼야 body가 안전영역 밖으로 튕기며
        // 상단에 컴포넌트가 노출되는 현상이 사라진다.
        webView?.scrollView.bounces = false
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)

        guard AVCaptureDevice.authorizationStatus(for: .video) == .notDetermined else {
            return
        }

        AVCaptureDevice.requestAccess(for: .video) { _ in }
    }
}
