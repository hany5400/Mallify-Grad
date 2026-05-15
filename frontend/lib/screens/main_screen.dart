import 'package:flutter/material.dart';
import 'homeScreen.dart';
import 'profileScreen.dart';
import 'filteringScreen.dart';
import 'notificationsScreen.dart';

class MainScreen extends StatefulWidget {
  final String role;
  final bool showSuccessMessage;
  final int initialTab;
  final String? initialMallId;
  final List<dynamic>? initialTargets;
  final String? initialBrandTier;

  const MainScreen({
    Key? key,
    required this.role,
    this.showSuccessMessage = false,
    this.initialTab = 0,
    this.initialMallId,
    this.initialTargets,
    this.initialBrandTier,
  }) : super(key: key);

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;


  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTab;
    

    if (widget.showSuccessMessage) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Container(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: const Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.white),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Request successful! Your choices have been saved.',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            margin: const EdgeInsets.only(bottom: 20, left: 16, right: 16),
            duration: const Duration(seconds: 4),
            elevation: 6,
          ),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      HomeScreen(role: widget.role),
      FilteringScreen(
        isActive: _currentIndex == 1,
        role: widget.role,
        initialMallId: widget.initialMallId,
        initialTargets: widget.initialTargets,
        initialBrandTier: widget.initialBrandTier,
      ),
      const NotificationsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          selectedItemColor: const Color(0xFF4A90E2),
          unselectedItemColor: Colors.grey,
          showUnselectedLabels: true,
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.filter_list_outlined),
              activeIcon: Icon(Icons.filter_list),
              label: 'Filter',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.notifications_outlined),
              activeIcon: Icon(Icons.notifications),
              label: 'Notifications',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
