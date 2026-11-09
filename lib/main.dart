// Nubo · app nativa para Android.
// Los 19 juegos y la plataforma están en assets/www (HTML + JS) y se sirven
// desde un servidor local dentro del móvil, así funcionan sin conexión.
// Aquí vive lo nativo: pantalla completa, botón «atrás», vibración y,
// más adelante, Firebase (analítica), anuncios y compras.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

const _port = 8080;
final _server = InAppLocalhostServer(documentRoot: 'assets/www', port: _port);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(0xFFEEF1FB),
    systemNavigationBarColor: Color(0xFFEEF1FB),
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
  await _server.start();
  runApp(const NuboApp());
}

class NuboApp extends StatelessWidget {
  const NuboApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Nubo',
      debugShowCheckedModeBanner: false,
      home: NuboHome(),
    );
  }
}

class NuboHome extends StatefulWidget {
  const NuboHome({super.key});

  @override
  State<NuboHome> createState() => _NuboHomeState();
}

class _NuboHomeState extends State<NuboHome> with WidgetsBindingObserver {
  InAppWebViewController? _web;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // Al salir de la app se pausan la música y los temporizadores de los juegos.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused) _web?.pause();
    if (state == AppLifecycleState.resumed) _web?.resume();
  }

  // Botón «atrás» de Android: primero cierra hojas, juegos y pantallas dentro de Nubo.
  Future<void> _onBack() async {
    final handled = await _web?.evaluateJavascript(
        source: 'window.nuboBack ? window.nuboBack() : false');
    if (handled != true) SystemNavigator.pop();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _onBack();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFEEF1FB),
        // SafeArea: el contenido no queda debajo de la barra de estado ni de la de navegación.
        body: SafeArea(child: InAppWebView(
          initialUrlRequest:
              URLRequest(url: WebUri('http://localhost:$_port/index.html')),
          initialSettings: InAppWebViewSettings(
            mediaPlaybackRequiresUserGesture: false,
            supportZoom: false,
            builtInZoomControls: false,
            displayZoomControls: false,
            useHybridComposition: true,
            domStorageEnabled: true,
            databaseEnabled: true,
            transparentBackground: true,
            disableContextMenu: true,
            verticalScrollBarEnabled: false,
            horizontalScrollBarEnabled: false,
            overScrollMode: OverScrollMode.NEVER,
          ),
          onWebViewCreated: (controller) {
            _web = controller;
            // Vibración nativa (más fiable que la del navegador).
            controller.addJavaScriptHandler(
                handlerName: 'vibrate',
                callback: (args) => HapticFeedback.mediumImpact());
            // Eventos de juego: aquí se enviarán a Firebase Analytics.
            controller.addJavaScriptHandler(
                handlerName: 'event',
                callback: (args) {
                  debugPrint('nubo-event: $args');
                  return null;
                });
          },
          onPermissionRequest: (controller, request) async =>
              PermissionResponse(
                  resources: request.resources,
                  action: PermissionResponseAction.GRANT),
        )),
      ),
    );
  }
}
