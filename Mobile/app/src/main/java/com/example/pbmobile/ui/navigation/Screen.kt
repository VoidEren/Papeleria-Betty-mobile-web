package com.example.pbmobile.ui.navigation

sealed class Screen {
    data object Login : Screen()
    data class Dashboard(
        val userName: String = "María García",
        val userEmail: String = "maria@demo.com"
    ) : Screen()
}
