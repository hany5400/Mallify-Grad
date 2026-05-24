import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/apiService.dart';
import 'editProfileScreen.dart';
import 'authScreen.dart';
import 'paymentScreen.dart';
import 'dart:ui';
import 'package:intl/intl.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? userData;
  List<dynamic> requestHistory = [];
  bool isLoading = true;
  String planType = 'free';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => isLoading = true);
    final profileRes = await ApiService.getCurrentUser();
    final historyRes = await ApiService.getUserHistory();
    final premiumRes = await ApiService.checkPremiumStatus();
    
    if (profileRes['ok'] == true) {
      userData = profileRes['data'];
    }
    
    if (historyRes['ok'] == true) {
      requestHistory = historyRes['data'];
    }

    if (premiumRes['ok'] == true && premiumRes['data'] != null) {
      planType = premiumRes['data']['plan_type'] ?? 'free';
    }
    
    setState(() => isLoading = false);
  }

  Future<void> _handleAvatarAction() async {
    final avatar = userData?['avatar'];
    if (avatar != null && avatar.toString().isNotEmpty) {
      // Delete logic
      final bool? confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Remove Photo?'),
          content: const Text('Are you sure you want to remove your profile photo?'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Remove', style: TextStyle(color: Colors.red))),
          ],
        ),
      );

      if (confirm == true) {
        setState(() => isLoading = true);
        final response = await ApiService.deleteAvatar();
        if (response['ok'] == true) {
          _loadData();
        } else {
          setState(() => isLoading = false);
        }
      }
    } else {
      // Pick logic
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);

      if (image != null) {
        setState(() => isLoading = true);
        final response = await ApiService.updateAvatar(image.path);
        if (response['ok'] == true) {
          _loadData();
        } else {
          setState(() => isLoading = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: Color(0xFF2563EB))));
    }

    if (userData == null) {
      return const Scaffold(body: Center(child: Text('User not found')));
    }

    final avatar = userData!['avatar'];
    final name = userData!['name'] ?? 'User';
    final email = userData!['email'] ?? '';
    final code = userData!['user_code'] ?? '---';
    final points = userData!['points'] ?? 0;
    final hasAvatar = avatar != null && avatar.toString().isNotEmpty;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        leadingWidth: 160,
        leading: Align(
          alignment: Alignment.centerLeft,
          child: Padding(
            padding: const EdgeInsets.only(left: 16),
            child: planType == 'free'
              ? GestureDetector(
                  onTap: _showSubscriptionPopup,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B82F6).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.workspace_premium_rounded, color: Color(0xFF3B82F6), size: 14),
                        SizedBox(width: 4),
                        Text('Upgrade Plan', style: TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.2)),
                      ],
                    ),
                  ),
                )
              : Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.verified_rounded, color: Color(0xFFF59E0B), size: 14),
                      SizedBox(width: 4),
                      Text('PRO PLAN', style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.2)),
                    ],
                  ),
                ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFEF4444)),
            onPressed: () => Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => const AuthScreen()), (route) => false),
          ),
        ],
      ),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // Background
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
          SingleChildScrollView(
            child: Column(
              children: [
                const SizedBox(height: kToolbarHeight + 40),
                // Avatar
                Center(
                  child: Stack(
                    children: [
                      Container(
                        width: 110,
                        height: 110,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10))
                          ],
                          image: hasAvatar
                              ? DecorationImage(
                                  image: NetworkImage(ApiService.getImageUrl(avatar.toString())),
                                  fit: BoxFit.cover,
                                )
                              : null,
                        ),
                        child: !hasAvatar
                            ? Center(
                                child: Text(
                                  name.isNotEmpty ? name[0].toUpperCase() : 'U',
                                  style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Color(0xFF2563EB)),
                                ),
                              )
                            : null,
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: _handleAvatarAction,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: hasAvatar ? Colors.redAccent : const Color(0xFF2563EB),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: Icon(
                              hasAvatar ? Icons.delete_outline : Icons.add,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Text(name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                Text(
                  email.startsWith('fb_') && email.endsWith('@mallify.com')
                      ? 'Connected with Facebook'
                      : email,
                  style: const TextStyle(fontSize: 14, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 32),

                // Stats Cards
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Expanded(child: _buildStatCard('User Code', code, Icons.qr_code_scanner, color: const Color(0xFF64748B), bgColor: const Color(0xFFF8FAFC))),
                      const SizedBox(width: 16),
                      Expanded(child: _buildStatCard('Points', points.toString(), Icons.stars_rounded, color: const Color(0xFF65A30D), bgColor: const Color(0xFFF7FEE7))),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Edit Profile Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: SizedBox(
                    width: double.infinity,
                    height: 55,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => EditProfileScreen(userData: userData!)),
                        ).then((_) => _loadData());
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 0,
                      ),
                      child: const Text('Edit Profile', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
                const SizedBox(height: 40),

                // History Section
                Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.history, size: 22, color: Color(0xFF0F172A)),
                          SizedBox(width: 8),
                          Text('History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (requestHistory.isEmpty)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 40),
                            child: Text('No request history yet', style: TextStyle(color: Colors.grey)),
                          ),
                        )
                      else
                        ...requestHistory.asMap().entries.map((entry) {
                          int idx = entry.key;
                          var req = entry.value;
                          return _buildHistoryItem(idx + 1, req);
                        }).toList(),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, {required Color color, required Color bgColor}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, 5))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(height: 12),
          Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: color == const Color(0xFF65A30D) ? color : const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }

  final Set<int> _expandedIndices = {};

  Widget _buildHistoryItem(int displayIndex, dynamic req) {
    List<dynamic> items = req['items'] ?? [];
    double budget = double.tryParse(req['budget']?.toString() ?? '0') ?? 0;
    bool isExpanded = _expandedIndices.contains(displayIndex);
    
    // Format date if available, or use current as placeholder
    String dateStr = req['published_at'] != null 
      ? DateFormat('MMM d, yyyy').format(DateTime.parse(req['published_at'].toString()))
      : 'Recently';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          // Header
          InkWell(
            onTap: () => setState(() => isExpanded ? _expandedIndices.remove(displayIndex) : _expandedIndices.add(displayIndex)),
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Request #$displayIndex', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                      const SizedBox(height: 4),
                      Text(dateStr, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
                    ],
                  ),
                  Row(
                    children: [
                      Text('EGP ${budget.toStringAsFixed(0)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                      const SizedBox(width: 8),
                      Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, size: 20, color: const Color(0xFF94A3B8)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          if (isExpanded) ...[
            const Divider(height: 1, color: Color(0xFFF1F5F9)),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: items.map((item) => _buildCompactProductItem(item)).toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCompactProductItem(dynamic item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          // Product Image
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
            child: (item['category_image'] != null && item['category_image'].toString().isNotEmpty)
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(
                    ApiService.getImageUrl(item['category_image'].toString()),
                    fit: BoxFit.cover,
                  ),
                )
              : (item['product_image'] != null && item['product_image'].toString().isNotEmpty)
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        ApiService.getImageUrl(item['product_image'].toString()),
                        fit: BoxFit.cover,
                      ),
                    )
                  : const Icon(Icons.shopping_bag_outlined, size: 24, color: Color(0xFF94A3B8)),
          ),
          const SizedBox(width: 12),
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['product_name'] ?? 'Product',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF334155)),
                ),
                Text(
                  '${item['product_category_name'] ?? 'Item'} • ${item['store_name'] ?? 'Store'}',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                ),
                Text(
                  'Size: ${item['size'] ?? 'N/A'}',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          // Price
          Text(
            'EGP ${double.tryParse(item['price']?.toString() ?? '0')?.toStringAsFixed(0)}',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
          ),
        ],
      ),
    );
  }

  void _showSubscriptionPopup() {
    showDialog(
      context: context,
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              color: Colors.white.withOpacity(0.4),
              border: Border.all(color: Colors.white.withOpacity(0.6), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 30,
                  spreadRadius: 5,
                )
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF60A5FA), Color(0xFF3B82F6)],
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF3B82F6).withOpacity(0.5),
                      blurRadius: 15,
                      spreadRadius: 2,
                    )
                  ],
                ),
                child: const Icon(Icons.diamond_rounded, color: Colors.white, size: 48),
              ),
              const SizedBox(height: 24),
              const Text(
                'Premium Plan Required',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
              ),
              const SizedBox(height: 12),
              const Text(
                'Upgrade to Premium for unlimited searches and exclusive features!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 15, color: Color(0xFF6B7280), height: 1.5),
              ),
              const SizedBox(height: 32),
              // Plan Options
              _buildPlanOption(
                title: 'Premium Monthly',
                price: '499 EGP / Month',
                icon: Icons.flash_on_rounded,
                isRecommended: true,
              ),
              const SizedBox(height: 12),
              _buildPlanOption(
                title: 'Premium Yearly',
                price: '4,990 EGP / Year',
                icon: Icons.verified_rounded,
                isRecommended: false,
              ),
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF60A5FA), Color(0xFF3B82F6)]),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF3B82F6).withOpacity(0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    )
                  ],
                ),
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const PaymentScreen(
                          planTitle: 'Premium Monthly',
                          price: '499 EGP',
                          durationMonths: 1.0,
                        ),
                      ),
                    ).then((_) => _loadData()); // Refresh data after returning from payment
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Upgrade Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Maybe Later', style: TextStyle(color: Color(0xFF6B7280))),
              ),
            ],
          ),
        ),
      ),
    ),
    );
  }

  Widget _buildPlanOption({required String title, required String price, required IconData icon, bool isRecommended = false}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.6),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isRecommended ? const Color(0xFF3B82F6) : Colors.white.withOpacity(0.6), width: 1.5),
        boxShadow: [
          if (isRecommended)
            BoxShadow(color: const Color(0xFF3B82F6).withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isRecommended ? const Color(0xFF3B82F6).withOpacity(0.1) : Colors.white.withOpacity(0.8),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: isRecommended ? const Color(0xFF3B82F6) : const Color(0xFF6B7280), size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1F2937))),
                const SizedBox(height: 4),
                Text(price, style: const TextStyle(color: Color(0xFF6B7280), fontSize: 13)),
              ],
            ),
          ),
          if (isRecommended)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF60A5FA), Color(0xFF3B82F6)]),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('BEST', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
    );
  }
}
