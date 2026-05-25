import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/apiService.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  int _selectedTab = 0;
  final List<String> _tabs = ['All', 'Requests', 'Promotions', 'Updates'];
  bool _isLoading = true;
  List<Map<String, dynamic>> _notifications = [];
  Set<String> _readIds = {};

  @override
  void initState() {
    super.initState();
    _loadReadStatus().then((_) => _fetchNotifications());
  }

  Future<void> _loadReadStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final readList = prefs.getStringList('read_notification_ids') ?? [];
    setState(() {
      _readIds = readList.toSet();
    });
  }

  Future<void> _fetchNotifications() async {
    setState(() => _isLoading = true);
    final data = await ApiService.getNotifications();
    setState(() {
      _notifications = List<Map<String, dynamic>>.from(data).map((n) {
        return {
          ...n,
          'isRead': _readIds.contains(n['id']),
        };
      }).toList();
      _isLoading = false;
    });
  }

  Future<void> _markAsRead(String? id) async {
    if (id == null) return;
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _readIds.add(id);
      // Update local state immediately
      for (var n in _notifications) {
        if (n['id'] == id) n['isRead'] = true;
      }
    });
    await prefs.setStringList('read_notification_ids', _readIds.toList());
  }

  Future<void> _markAllAsRead() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      for (var n in _notifications) {
        if (n['id'] != null) {
          _readIds.add(n['id']);
          n['isRead'] = true;
        }
      }
    });
    await prefs.setStringList('read_notification_ids', _readIds.toList());
  }

  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'check_circle_outline': return Icons.check_circle_outline;
      case 'local_offer_outlined': return Icons.local_offer_outlined;
      case 'storefront_outlined': return Icons.storefront_outlined;
      case 'business_outlined': return Icons.business_outlined;
      case 'bolt_outlined': return Icons.bolt;
      case 'person_outline': return Icons.person_outline;
      default: return Icons.notifications_none_outlined;
    }
  }

  Color _getColor(String? colorName) {
    switch (colorName) {
      case 'green': return Colors.green;
      case 'orange': return Colors.orange;
      case 'purple': return Colors.purple;
      case 'blue': return Colors.blue;
      case 'red': return Colors.red;
      case 'teal': return Colors.teal;
      default: return Colors.blue;
    }
  }

  List<Map<String, dynamic>> get _filteredNotifications {
    if (_selectedTab == 0) return _notifications; // All
    return _notifications.where((n) => n['type'] == _tabs[_selectedTab]).toList();
  }

  @override
  Widget build(BuildContext context) {
    final filteredItems = _filteredNotifications;
    
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.grey),
            onPressed: _fetchNotifications,
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: CircleAvatar(
              backgroundColor: Colors.grey[100],
              child: const Icon(Icons.tune, color: Colors.black54, size: 20),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/images/clothes bg.png',
              fit: BoxFit.cover,
            ),
          ),
          Positioned.fill(
            child: Container(
              color: Colors.white.withOpacity(0.2),
            ),
          ),
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Notifications',
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF2C3E50)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Real-time updates from Mallify',
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              _buildTabs(),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: GestureDetector(
                  onTap: _markAllAsRead,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Icon(Icons.check_box_outlined, size: 18, color: Colors.blue[700]),
                      const SizedBox(width: 6),
                      Text(
                        'Mark all as read',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.blue[700]),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : filteredItems.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.notifications_none_outlined, size: 64, color: Colors.grey[300]),
                                const SizedBox(height: 16),
                                Text('No notifications in ${_tabs[_selectedTab]}', 
                                  style: TextStyle(color: Colors.grey[500], fontWeight: FontWeight.w500)),
                              ],
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                            itemCount: filteredItems.length,
                            separatorBuilder: (context, index) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final item = filteredItems[index];
                              return _buildNotificationItem(item);
                            },
                          ),
              ),
            ],
          ),
        ),
      ],
      ),
    );
  }

  Widget _buildTabs() {
    return SizedBox(
      height: 45,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: _tabs.length,
        itemBuilder: (context, index) {
          bool isSelected = _selectedTab == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedTab = index),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 8),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF4A90E2) : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: isSelected ? null : Border.all(color: Colors.grey[200]!),
              ),
              child: Center(
                child: Text(
                  _tabs[index],
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.grey[600],
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildNotificationItem(Map<String, dynamic> item) {
    bool isRead = item['isRead'] ?? false;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isRead ? Colors.white : const Color(0xFFF8FAFF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isRead ? Colors.grey[100]! : const Color(0xFFE1E8F5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isRead ? 0.02 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Blue dot for unread
          if (!isRead)
            Padding(
              padding: const EdgeInsets.only(top: 15, right: 12),
              child: Container(
                width: 10,
                height: 10,
                decoration: const BoxDecoration(
                  color: Color(0xFF4A90E2), 
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Color(0x404A90E2), blurRadius: 4, spreadRadius: 2)]
                ),
              ),
            )
          else
            const SizedBox(width: 22),
          
          // Icon
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: _getColor(item['color']).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(_getIconData(item['icon']), color: _getColor(item['color']), size: 24),
          ),
          const SizedBox(width: 16),
          
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        item['title'],
                        style: TextStyle(
                          fontSize: 16, 
                          fontWeight: isRead ? FontWeight.bold : FontWeight.w900, 
                          color: const Color(0xFF2C3E50)
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  item['subtitle'],
                  style: TextStyle(fontSize: 13, color: Colors.grey[600], height: 1.4),
                ),
                const SizedBox(height: 8),
                Text(
                  item['time'],
                  style: TextStyle(fontSize: 11, color: Colors.grey[400]),
                ),
              ],
            ),
          ),
          
        ],
      ),
    );
  }
}
