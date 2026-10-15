package site.heddy.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(ArServerHttpPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
