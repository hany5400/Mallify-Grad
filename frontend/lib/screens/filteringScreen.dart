import 'package:flutter/material.dart';
import '../services/apiService.dart';
import 'alternativesScreen.dart';
import 'paymentScreen.dart';
import 'dart:ui';

class FilteringScreen extends StatefulWidget {
  final String? initialMallId;
  final List<dynamic>? initialTargets;
  final String? initialBrandTier;
  final bool isActive;
  final String role;

  const FilteringScreen({
    super.key,
    this.initialMallId,
    this.initialTargets,
    this.initialBrandTier,
    this.isActive = false,
    this.role = 'user',
  });

  @override
  State<FilteringScreen> createState() => _FilteringScreenState();
}

class _FilteringScreenState extends State<FilteringScreen> {
  final _formKey = GlobalKey<FormState>();
  final _budgetController = TextEditingController();
  String _selectedMall = "";
  List<dynamic> _malls = [];
  bool _isLoadingMalls = true;

  final List<Map<String, dynamic>> _items = [];

  Future<void> _checkAndShowSubscription() async {
    // System admins never see the subscription popup
    if (widget.role == 'system_admin') return;

    // Only check if it's a new user AND the screen is active
    if (!widget.isActive) return;

    final isNewUser = await ApiService.getIsNewUserFlag();
    if (!isNewUser) return;

    final response = await ApiService.checkPremiumStatus();
    if (response['ok'] == true && response['data'] != null) {
      final plan = response['data']['plan_type'];
      if (plan == 'free') {
        _showSubscriptionPopup();
        // Clear the flag so it only pops up once
        await ApiService.setNewUserFlag(false);
      }
    }
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
                    );
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

  @override
  void initState() {
    super.initState();
    _selectedMall = widget.initialMallId ?? "";
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.isActive) {
        _checkAndShowSubscription();
      }
    });

    if (widget.initialTargets != null && widget.initialTargets!.isNotEmpty) {
      for (var target in widget.initialTargets!) {
        String pref = "";
        String? size;
        
        final catName = target['category_name']?.toString();
        if (catName != null && catName.isNotEmpty && catName != 'All Types/Sizes') {
          pref = catName.split(' (')[0];
          size = target['category_size']?.toString();
        } else {
          pref = target['product_name'] ?? "";
        }

        // Normalize size
        String normalizedSize = 'any';
        if (size != null) {
          final s = size.toLowerCase();
          if (['small', 'medium', 'large', 'x-large'].contains(s)) {
            normalizedSize = s;
          }
        }

        _items.add({
          'search': TextEditingController(text: pref),
          'size': normalizedSize,
          'brand_tier': widget.initialBrandTier?.toLowerCase() ?? 'any',
          'isExpanded': _items.isEmpty, // Expand the first one
        });
      }
    }

    // Default item if none provided
    if (_items.isEmpty) {
      _items.add({
        'search': TextEditingController(),
        'size': 'any',
        'brand_tier': 'any',
        'isExpanded': true,
      });
    }

    _loadMalls();
  }

  @override
  void didUpdateWidget(covariant FilteringScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !oldWidget.isActive) {
      _checkAndShowSubscription();
    }
    // Auto-select mall when navigated from a mall card on the home screen
    if (widget.initialMallId != oldWidget.initialMallId &&
        widget.initialMallId != null &&
        widget.initialMallId!.isNotEmpty) {
      setState(() => _selectedMall = widget.initialMallId!);
    }
  }

  Future<void> _loadMalls() async {
    final malls = await ApiService.getAllMalls();
    if (mounted) {
      setState(() {
        _malls = malls;
        _isLoadingMalls = false;
      });
    }
  }

  void _addItem() {
    setState(() {
      for (var item in _items) {
        item['isExpanded'] = false;
      }
      _items.add({
        'search': TextEditingController(),
        'size': 'any',
        'brand_tier': 'any',
        'isExpanded': true,
      });
    });
  }

  void _removeItem(int index) {
    if (_items.length > 1) {
      setState(() {
        _items.removeAt(index);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // 1. Background Image
          Positioned.fill(
            child: Image.asset(
              'assets/images/clothes bg.png',
              fit: BoxFit.cover,
            ),
          ),
          // 2. Light Overlay
          Positioned.fill(
            child: Container(
              color: Colors.white.withOpacity(0.2),
            ),
          ),
          // 3. Main Content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Your first step in a',
                      style: TextStyle(fontSize: 16, color: Color(0xFF6B7280)),
                    ),
                    const SizedBox(height: 4),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: RichText(
                        text: const TextSpan(
                          style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, fontFamily: 'Outfit'),
                          children: [
                            TextSpan(text: 'Smarter ', style: TextStyle(color: Color(0xFF1F2937))),
                            TextSpan(text: 'Shopping Experience', style: TextStyle(color: Color(0xFF4A90E2))),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFF4A90E2),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Mall Selection & Budget Card
                    _buildFormCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('MALL'),
                          DropdownButtonFormField<String>(
                            value: _malls.any((m) => m['id'].toString() == _selectedMall) ? _selectedMall : "",
                            decoration: _inputDecoration('Choose Mall', Icons.store_outlined),
                            validator: (val) => (val == null || val.isEmpty) ? 'Please select a mall' : null,
                            items: [
                              const DropdownMenuItem<String>(
                                value: "",
                                child: Text('Select a Mall'),
                              ),
                              ..._malls.map((mall) {
                                return DropdownMenuItem<String>(
                                  value: mall['id'].toString(),
                                  child: Text(mall['mall_name']),
                                );
                              }),
                            ],
                            onChanged: (val) => setState(() => _selectedMall = val ?? ""),
                          ),
                          const SizedBox(height: 20),
                          _buildLabel('BUDGET'),
                          TextFormField(
                            controller: _budgetController,
                            decoration: _inputDecoration('e.g. 6500 EGP', Icons.account_balance_wallet_outlined),
                            keyboardType: TextInputType.number,
                            validator: (val) => val!.isEmpty ? 'Please enter budget' : null,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Dynamic Items List
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _items.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        return _buildItemCard(index);
                      },
                    ),

                    const SizedBox(height: 24),

                    // Add Another Item Button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _addItem,
                        icon: const Icon(Icons.add),
                        label: const Text('Add Another Item'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(color: Color(0xFFD1E4FF)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          backgroundColor: const Color(0xFFF0F7FF),
                          foregroundColor: const Color(0xFF4A90E2),
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Find Matches Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _submitRequest,
                        icon: const Icon(Icons.search),
                        label: const Text('Find Matches'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 18),
                          backgroundColor: const Color(0xFF4A90E2),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormCard({required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: child,
    );
  }

  Widget _buildItemCard(int index) {
    final item = _items[index];
    final bool isExpanded = item['isExpanded'];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        children: [
          ListTile(
            onTap: () => setState(() => item['isExpanded'] = !isExpanded),
            leading: const Icon(Icons.shopping_bag_outlined, color: Color(0xFF4A90E2)),
            title: Text(
              'Item ${index + 1}',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF374151)),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (_items.length > 1)
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                    onPressed: () => _removeItem(index),
                  ),
                Icon(isExpanded ? Icons.expand_less : Icons.expand_more),
              ],
            ),
          ),
          if (isExpanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('SEARCH FOR YOUR PREFERENCES...'),
                  TextFormField(
                    controller: item['search'],
                    decoration: _inputDecoration('e.g. Skinny Jeans, Oversized T-shirt', Icons.search_outlined),
                    validator: (val) => val!.isEmpty ? 'Enter preferences' : null,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildLabel('SIZE (OPTIONAL)'),
                            DropdownButtonFormField<String>(
                              value: item['size'],
                              isExpanded: true,
                              decoration: _inputDecoration('M, L, XL...', Icons.straighten_outlined),
                              items: const [
                                DropdownMenuItem(value: 'any', child: Text('Any')),
                                DropdownMenuItem(value: 'small', child: Text('Small')),
                                DropdownMenuItem(value: 'medium', child: Text('Medium')),
                                DropdownMenuItem(value: 'large', child: Text('Large')),
                                DropdownMenuItem(value: 'x-large', child: Text('X-Large')),
                              ],
                              onChanged: (val) => setState(() => item['size'] = val),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildLabel('BRAND TIER (OPTIONAL)'),
                            DropdownButtonFormField<String>(
                              value: item['brand_tier'],
                              isExpanded: true,
                              decoration: _inputDecoration('High-End, Local...', Icons.star_border_outlined),
                              items: const [
                                DropdownMenuItem(value: 'any', child: Text('Any')),
                                DropdownMenuItem(value: 'local', child: Text('Local')),
                                DropdownMenuItem(value: 'mid-tier', child: Text('Mid-Tier')),
                                DropdownMenuItem(value: 'high-end', child: Text('High-End')),
                              ],
                              onChanged: (val) => setState(() => item['brand_tier'] = val),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: FittedBox(
        fit: BoxFit.scaleDown,
        alignment: Alignment.centerLeft,
        child: Text(
          text,
          softWrap: false,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF6B7280)),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(icon, size: 20, color: Colors.grey),
      filled: true,
      fillColor: const Color(0xFFF9FAFB),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
    );
  }

  void _submitRequest() async {
    if (_formKey.currentState!.validate()) {
      // 1. Check subscription limit first
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      final check = await ApiService.checkSubscriptionLimit();
      if (!mounted) return;
      Navigator.pop(context); // Remove loading

      if (check['ok'] == false && check['message'] == 'LIMIT_REACHED' && widget.role != 'system_admin') {
        _showSubscriptionPopup();
        return;
      }

      final requestData = {
        'mall_id': _selectedMall.isEmpty ? null : _selectedMall,
        'budget': double.tryParse(_budgetController.text) ?? 0.0,
        'items': _items.map((i) => {
          'search': i['search'].text,
          'size': i['size'],
          'brand_tier': i['brand_tier'],
        }).toList(),
      };

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => AlternativesScreen(requestData: requestData),
        ),
      );
    }
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
