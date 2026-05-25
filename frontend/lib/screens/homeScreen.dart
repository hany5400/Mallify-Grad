import 'package:flutter/material.dart';
import '../services/apiService.dart';
import 'authScreen.dart';
import 'profileScreen.dart';
import 'filteringScreen.dart';
import 'main_screen.dart';
import 'userHistoryScreen.dart';
import 'package:intl/intl.dart';

class HomeScreen extends StatefulWidget {
  final String role;
  final VoidCallback? onOpenNotifications;
  final VoidCallback? onOpenFilter;
  final void Function(String mallId)? onMallSelected;

  const HomeScreen({
    Key? key,
    required this.role,
    this.onOpenNotifications,
    this.onOpenFilter,
    this.onMallSelected,
  }) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _malls = [];
  List<dynamic> _discounts = [];
  List<dynamic> _requestHistory = [];
  final Set<int> _expandedIndices = {};
  bool _isLoading = true;
  String _userDisplayName = 'User';
  int _userPoints = 0;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadMalls();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadMalls() async {
    setState(() => _isLoading = true);
    try {
      final malls = await ApiService.getAllMalls();
      final discounts = await ApiService.getAllPublicDiscounts();
      final userRes = await ApiService.getCurrentUser();
      final historyRes = await ApiService.getUserHistory(limit: 'all');

      if (mounted) {
        setState(() {
          _malls = malls;
          _discounts = discounts;
          if (historyRes['ok'] == true) {
            _requestHistory = historyRes['data'] ?? [];
          }
          if (userRes['ok'] == true && userRes['data'] != null) {
            final data = userRes['data'] as Map<String, dynamic>;
            final rawName = data['name']?.toString().trim();
            if (rawName != null && rawName.isNotEmpty) {
              _userDisplayName = rawName.split(' ').first;
            }
            final p = data['points'];
            if (p is int) {
              _userPoints = p;
            } else if (p != null) {
              _userPoints = int.tryParse(p.toString()) ?? 0;
            }
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _logout(BuildContext context) async {
    await ApiService.logout();
    if (!context.mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const AuthScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
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
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            // Top greeting + search (white strip; replaces blue header)
            Container(
              width: double.infinity,
              color: Colors.white,
              padding: EdgeInsets.fromLTRB(20, MediaQuery.paddingOf(context).top + 12, 20, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Hi, $_userDisplayName',
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                                height: 1.2,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF7FEE7),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.stars_rounded, color: Color(0xFF65A30D), size: 18),
                                  const SizedBox(width: 6),
                                  Text(
                                    '$_userPoints pts',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w900,
                                      color: Color(0xFF65A30D),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Material(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        child: InkWell(
                          onTap: widget.onOpenNotifications,
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: const Icon(
                              Icons.notifications_outlined,
                              color: Color(0xFF334155),
                              size: 22,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  // Search bar removed as per request
                ],
              ),
            ),

            // Discover Malls Section
            const Padding(
              padding: EdgeInsets.fromLTRB(24, 32, 24, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Discover Malls',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
                  ),
                ],
              ),
            ),

            _isLoading
                ? const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator()))
                : _malls.isEmpty
                    ? _buildEmptyState()
                    : SizedBox(
                        height: 240,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          scrollDirection: Axis.horizontal,
                          itemCount: _malls.length,
                          itemBuilder: (context, index) {
                            final mall = _malls[index];
                            return _buildMallCard(mall);
                          },
                        ),
                      ),

            const SizedBox(height: 32),

            // Previous Requests Section
            if (!_isLoading && _requestHistory.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Previous Requests',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const UserHistoryScreen(),
                          ),
                        );
                      },
                      child: const Text(
                        'View All',
                        style: TextStyle(
                          color: Color(0xFF2563EB),
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: _requestHistory.take(2).toList().asMap().entries.map((entry) {
                    final localIndex = entry.key + 1;
                    final req = entry.value;
                    final absoluteIndex = _requestHistory.length - _requestHistory.indexOf(req);
                    return _buildHomeRequestCard(localIndex, absoluteIndex, req);
                  }).toList(),
                ),
              ),
            ],
            
            const SizedBox(height: 32),
            
            // Special Offers Section
            if (_discounts.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Special Offers',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
                    ),
                    Text(
                      '${_discounts.length} Active',
                      style: const TextStyle(color: Color(0xFFE67E22), fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 230,
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: _discounts.length,
                  itemBuilder: (context, index) {
                    return _buildDiscountCard(_discounts[index]);
                  },
                ),
              ),
            ],
            if (_discounts.isEmpty && !_isLoading) ...[
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                child: Text(
                  'No active offers at the moment.',
                  style: TextStyle(color: Colors.grey, fontSize: 14, fontStyle: FontStyle.italic),
                ),
              ),
            ],
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    ],
  ),
);
}

  Widget _buildMallCard(dynamic mall) {
    final imageUrl = ApiService.getImageUrl(mall['image_url']);
    final mallId = mall['id']?.toString() ?? '';

    return GestureDetector(
      onTap: () {
        if (mallId.isNotEmpty && widget.onMallSelected != null) {
          widget.onMallSelected!(mallId);
        }
      },
      child: Container(
        width: 300,
        margin: const EdgeInsets.symmetric(horizontal: 8),
        child: Card(
          clipBehavior: Clip.antiAlias,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 8,
          shadowColor: Colors.black26,
          child: Stack(
            children: [
              // Image
              Positioned.fill(
                child: imageUrl.isNotEmpty
                    ? Image.network(
                        imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (c, e, s) => Container(color: Colors.grey[200], child: const Icon(Icons.image, size: 50)),
                      )
                    : Container(color: Colors.grey[200], child: const Icon(Icons.image, size: 50)),
              ),
              // Gradient Overlay
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                    ),
                  ),
                ),
              ),
              // Mall Name
              Positioned(
                bottom: 20,
                left: 20,
                right: 20,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      mall['mall_name'] ?? 'Mystery Mall',
                      style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: const [
                        Icon(Icons.location_on, color: Colors.white70, size: 14),
                        SizedBox(width: 4),
                        Text('Shop Here', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDiscountCard(dynamic discount) {
    final storeImage = ApiService.getImageUrl(discount['store_image']);
    final targets = (discount['targets'] as List? ?? []);
    String offerOn = "All Products";
    if (targets.isNotEmpty) {
      offerOn = targets.map((t) => t['category_name'] ?? 'General').take(2).join(', ');
      if (targets.length > 2) offerOn += " +${targets.length - 2} more";
    }

    return GestureDetector(
      onTap: () {
        final mallId = discount['mall_id']?.toString();
        final brandTier = discount['store_brand_tier']?.toString();
        
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => MainScreen(
              role: widget.role,
              initialTab: 1, // Filtering screen
              initialMallId: mallId,
              initialTargets: targets,
              initialBrandTier: brandTier,
            ),
          ),
        );
      },
      child: Container(
        width: 320,
        margin: const EdgeInsets.symmetric(horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: IntrinsicHeight(
          child: Row(
            children: [
              // Left Side: Store Image
              Container(
                width: 120,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(24),
                    bottomLeft: Radius.circular(24),
                  ),
                  image: storeImage.isNotEmpty
                      ? DecorationImage(image: NetworkImage(storeImage), fit: BoxFit.cover)
                      : null,
                  color: Colors.grey[100],
                ),
                child: storeImage.isEmpty ? const Icon(Icons.store, color: Colors.grey) : null,
              ),
              // Right Side: Info
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEBF5FF),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              discount['store_name'] ?? 'Store',
                              style: const TextStyle(color: Color(0xFF4A90E2), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                          Row(
                            children: [
                              const Icon(Icons.circle, size: 8, color: Color(0xFF2ECC71)),
                              const SizedBox(width: 4),
                              Text('Active', style: TextStyle(color: Colors.green[700], fontSize: 11, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        discount['title'] ?? 'Sale!',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2C3E50), height: 1.2),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Offer on $offerOn',
                        style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.4),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (discount['mall_name'] != null && discount['mall_name'].toString().isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                discount['mall_name'],
                                style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w500),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.verified_user_outlined, size: 16, color: Color(0xFF4A90E2)),
                              const SizedBox(width: 6),
                              const Text('Official Offer', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF2C3E50))),
                            ],
                          ),
                          Text(
                            '${discount['amount']}% OFF',
                            style: const TextStyle(color: Color(0xFFE74C3C), fontSize: 16, fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: const [
          SizedBox(height: 40),
          Icon(Icons.storefront_outlined, size: 60, color: Colors.grey),
          SizedBox(height: 16),
          Text('No malls found yet.', style: TextStyle(color: Colors.grey, fontSize: 16)),
        ],
      ),
    );
  }

  Widget _buildHomeRequestCard(int displayIndex, int absoluteIndex, dynamic req) {
    List<dynamic> items = req['items'] ?? [];
    double budget = double.tryParse(req['budget']?.toString() ?? '0') ?? 0;
    
    String dateStr = req['published_at'] != null 
      ? DateFormat('MMM d, yyyy').format(DateTime.parse(req['published_at'].toString()))
      : 'Recently';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withOpacity(0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => UserHistoryScreen(
                  initialSearchQuery: 'Request #$absoluteIndex',
                ),
              ),
            );
          },
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Info Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Request #$displayIndex',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '${items.length} ${items.length == 1 ? "Item" : "Items"}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF2563EB),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        dateStr,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF94A3B8),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Overlapping previews
                      if (items.isNotEmpty)
                        SizedBox(
                          height: 32,
                          child: Stack(
                            children: List.generate(
                              items.length > 4 ? 4 : items.length,
                              (idx) {
                                final item = items[idx];
                                final isLast = idx == 3 && items.length > 4;
                                return Positioned(
                                  left: idx * 24.0,
                                  child: Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.05),
                                          blurRadius: 4,
                                        )
                                      ],
                                    ),
                                    child: isLast
                                        ? Container(
                                            decoration: const BoxDecoration(
                                              color: Color(0xFF1E293B),
                                              shape: BoxShape.circle,
                                            ),
                                            child: Center(
                                              child: Text(
                                                '+${items.length - 3}',
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          )
                                        : ClipRRect(
                                            borderRadius: BorderRadius.circular(16),
                                            child: _buildItemImage(item),
                                          ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                
                // Right Column (Budget & Arrow)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'EGP ${budget.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Color(0xFFF1F5F9),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.chevron_right_rounded,
                        color: Color(0xFF64748B),
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildItemImage(dynamic item) {
    if (item['category_image'] != null && item['category_image'].toString().isNotEmpty) {
      return Image.network(
        ApiService.getImageUrl(item['category_image'].toString()),
        fit: BoxFit.cover,
        errorBuilder: (c, e, s) => const Icon(Icons.shopping_bag_outlined, size: 14, color: Color(0xFF94A3B8)),
      );
    } else if (item['product_image'] != null && item['product_image'].toString().isNotEmpty) {
      return Image.network(
        ApiService.getImageUrl(item['product_image'].toString()),
        fit: BoxFit.cover,
        errorBuilder: (c, e, s) => const Icon(Icons.shopping_bag_outlined, size: 14, color: Color(0xFF94A3B8)),
      );
    }
    return const Icon(Icons.shopping_bag_outlined, size: 14, color: Color(0xFF94A3B8));
  }
}
