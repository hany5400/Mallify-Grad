import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/landingScreen.dart';
import 'screens/authScreen.dart';

class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (X509Certificate cert, String host, int port) => true;
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (kIsWeb) {
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: 'AIzaSyBR61taCBHITCGax84uX4CV6jwMnI80AQc',
        appId: '1:157816088543:web:8c6f9d46a4aa64a47ac66a',
        messagingSenderId: '157816088543',
        projectId: 'mallify-82b01',
        authDomain: 'mallify-82b01.firebaseapp.com',
        storageBucket: 'mallify-82b01.firebasestorage.app',
        measurementId: 'G-KDLKDJ42HT',
      ),
    );
  } else {
    HttpOverrides.global = MyHttpOverrides();
    await Firebase.initializeApp();
  }

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mallify',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4A90E2)),
        useMaterial3: true,
      ),
      home: const LandingScreen(),
    );
  }
}