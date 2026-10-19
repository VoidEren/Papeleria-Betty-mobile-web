package com.example.pbmobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.pbmobile.ui.navigation.Screen
import com.example.pbmobile.ui.screens.DashboardScreen
import com.example.pbmobile.ui.screens.LoginScreen
import com.example.pbmobile.ui.theme.PBMobileTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PBMobileTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    PapeleriaBettyApp()
                }
            }
        }
    }
}

@Composable
fun PapeleriaBettyApp() {
    var currentScreen by remember { mutableStateOf<Screen>(Screen.Login) }

    AnimatedContent(
        targetState = currentScreen,
        transitionSpec = { fadeIn() togetherWith fadeOut() },
        label = "ScreenTransition"
    ) { screen ->
        when (screen) {
            is Screen.Login -> {
                LoginScreen(
                    onLoginSuccess = { name, email ->
                        currentScreen = Screen.Dashboard(userName = name, userEmail = email)
                    }
                )
            }

            is Screen.Dashboard -> {
                BackHandler {
                    currentScreen = Screen.Login
                }
                DashboardScreen(
                    userName = screen.userName,
                    userEmail = screen.userEmail,
                    onLogout = {
                        currentScreen = Screen.Login
                    }
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun AppPreview() {
    PBMobileTheme {
        PapeleriaBettyApp()
    }
}
