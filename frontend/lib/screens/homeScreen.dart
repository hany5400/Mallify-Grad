import 'package:flutter/material.dart';
import '../services/apiService.dart';
import 'authScreen.dart';
import 'profileScreen.dart';
import 'filteringScreen.dart';
import 'main_screen.dart';

class HomeScreen extends StatefulWidget {
  final String role;
  
  const HomeScreen({Key? key, required this.role}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _malls = [];
  List<dynamic> _discounts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMalls();
  }

  Future<void> _loadMalls() async {
    setState(() => _isLoading = true);
    try {
      final malls = await ApiService.getAllMalls();
      final discounts = await ApiService.getAllPublicDiscounts();

      if (mounted) {
        setState(() {
          _malls = malls;
          _discounts = discounts;
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
      appBar: AppBar(
        title: const Text(
          'MALLIFY',
          style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 22),
        ),
        backgroundColor: const Color(0xFF4A90E2),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
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
            // Welcome Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Color(0xFF4A90E2),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(32),
                  bottomRight: Radius.circular(32),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Welcome Back,',
                    style: TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Explore What\'s New',
                    style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
                  ),
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
                  Text(
                    'See All',
                    style: TextStyle(color: Color(0xFF4A90E2), fontWeight: FontWeight.w600),
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
    
    return Container(
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
                      Text('Visit Now', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    ],
                  ),
                ],
              ),
            ),
          ],
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
}
