import 'dart:async';
import 'package:flutter/material.dart';
import '../widgets/safeNetworkImage.dart';
import '../services/apiService.dart';
import 'summaryScreen.dart';

class AlternativesScreen extends StatefulWidget {
  final Map<String, dynamic> requestData;

  const AlternativesScreen({Key? key, required this.requestData}) : super(key: key);

  @override
  State<AlternativesScreen> createState() => _AlternativesScreenState();
}

class _AlternativesScreenState extends State<AlternativesScreen> {
  bool _isInitialLoading = true;
  Map<int, bool> _itemLoading = {};
  Map<int, List<dynamic>> _allAlternatives = {}; // Original list from API
  Map<int, List<dynamic>> _displayAlternatives = {}; // List shown on screen
  Map<int, List<dynamic>> _selectedAlternatives = {};
  Map<int, TextEditingController> _searchControllers = {};

  @override
  void initState() {
    super.initState();
    _fetchMatches();
  }

  @override
  void dispose() {
    for (var controller in _searchControllers.values) controller.dispose();
    super.dispose();
  }

  Future<void> _fetchMatches() async {
    setState(() => _isInitialLoading = true);
    
    final items = widget.requestData['items'] as List;
    final mallId = widget.requestData['mall_id'];

    // Fetch for all items (initial load only)
    for (int i = 0; i < items.length; i++) {
      _itemLoading[i] = true;
      final item = items[i];
      _selectedAlternatives[i] = [];
      
      final response = await ApiService.findMatches({
        'mall_id': mallId,
        'budget': widget.requestData['budget'],
        'search': item['search'],
        'size': item['size'],
        'brand_tier': item['brand_tier'],
      });

      if (response['ok'] == true) {
        _allAlternatives[i] = response['data'];
        _displayAlternatives[i] = List.from(response['data']);
      }
      _itemLoading[i] = false;
    }
    
    if (mounted) {
      setState(() => _isInitialLoading = false);
    }
  }

  void _onSearchChanged(int index, String query) {
    setState(() {
      if (query.trim().isEmpty) {
        // Reset to original list
        _displayAlternatives[index] = List.from(_allAlternatives[index] ?? []);
      } else {
        final keywords = query
            .trim()
            .toLowerCase()
            .split(RegExp(r"\s+"))
            .map((kw) => kw.replaceAll('-', ''))
            .where((kw) => kw.isNotEmpty)
            .toList();

        _displayAlternatives[index] = (_allAlternatives[index] ?? []).where((item) {
          final pName = (item['product_name'] ?? '')
              .toString()
              .toLowerCase()
              .replaceAll(' ', '')
              .replaceAll('-', '');
          final cName = (item['product_category_name'] ?? '')
              .toString()
              .toLowerCase()
              .replaceAll(' ', '')
              .replaceAll('-', '');
          final sName = (item['store_name'] ?? '')
              .toString()
              .toLowerCase()
              .replaceAll(' ', '')
              .replaceAll('-', '');
          
          // Match all keywords (Smart Search logic)
          return keywords.every((kw) => 
            pName.contains(kw) || cName.contains(kw) || sName.contains(kw)
          );
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final items = widget.requestData['items'] as List;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Alternatives', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isInitialLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                // Background Image
                Positioned.fill(
                  child: Image.asset(
                    'assets/images/clothes bg.png',
                    fit: BoxFit.cover,
                  ),
                ),
                // Light Overlay
                Positioned.fill(
                  child: Container(
                    color: Colors.white.withOpacity(0.4),
                  ),
                ),
                Column(
                  children: [
                    const SizedBox(height: 16),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Choose Your Alternatives',
                              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Refine your search for each item to find the perfect match',
                              style: TextStyle(color: Colors.grey, fontSize: 16),
                            ),
                            const SizedBox(height: 32),
                            
                            ...List.generate(items.length, (index) {
                              return _buildItemAlternatives(index, items[index]);
                            }),
                          ],
                        ),
                      ),
                    ),
                    _buildBottomBar(),
                  ],
                ),
              ],
            ),
    );
  }

  double get _totalSpent {
    double total = 0;
    _selectedAlternatives.forEach((key, list) {
      for (var item in list) {
        final originalPrice = double.tryParse(item['price'].toString()) ?? 0.0;
        final discountPercent = double.tryParse(item['discount_percentage']?.toString() ?? '') ?? 0.0;
        final discountedPrice = originalPrice * (1 - (discountPercent / 100));
        total += discountedPrice;
      }
    });
    return total;
  }

  Widget _buildBudgetHeader() {
    final totalBudget = double.tryParse(widget.requestData['budget'].toString()) ?? 0.0;
    final remaining = totalBudget - _totalSpent;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('TOTAL BUDGET', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
              Text('${totalBudget.toStringAsFixed(0)} EGP', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF1F2937))),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: remaining >= 0 ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: remaining >= 0 ? const Color(0xFFDCFCE7) : const Color(0xFFFCA5A5)),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.account_balance_wallet, 
                  size: 16, 
                  color: remaining >= 0 ? const Color(0xFF166534) : const Color(0xFF991B1B)
                ),
                const SizedBox(width: 8),
                Text(
                  '${remaining.toStringAsFixed(0)} EGP',
                  style: TextStyle(
                    fontWeight: FontWeight.bold, 
                    color: remaining >= 0 ? const Color(0xFF166534) : const Color(0xFF991B1B)
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemAlternatives(int index, dynamic itemInfo) {
    final list = _displayAlternatives[index] ?? [];
    
    if (!_searchControllers.containsKey(index)) {
      _searchControllers[index] = TextEditingController(text: (itemInfo['search'] ?? '').toString());
    }
    final searchController = _searchControllers[index]!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0F2FE),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Item ${index + 1}',
                    style: const TextStyle(
                      color: Color(0xFF0284C7), 
                      fontSize: 12, 
                      fontWeight: FontWeight.bold
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  (itemInfo['search'] ?? '').toString(),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
                ),
              ],
            ),
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F9FF),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE0F2FE)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.edit_outlined, size: 14, color: Color(0xFF0284C7)),
                    SizedBox(width: 4),
                    Text('Edit', style: TextStyle(fontSize: 12, color: Color(0xFF0284C7), fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Search bar for local filtering
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
          ),
          child: TextFormField(
            controller: searchController,
            decoration: InputDecoration(
              hintText: 'Filter Item ${index + 1} results...',
              prefixIcon: const Icon(Icons.search, color: Color(0xFF166534)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            onChanged: (val) => _onSearchChanged(index, val),
          ),
        ),
        const SizedBox(height: 16),
        if (_itemLoading[index] == true)
          const SizedBox(height: 220, child: Center(child: CircularProgressIndicator(color: Color(0xFF166534))))
        else if (list.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            margin: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFDCFCE7)),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: Color(0xFF166534)),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "We couldn't find matches for this item among the loaded results.",
                    style: TextStyle(color: Color(0xFF166534), fontSize: 14),
                  ),
                ),
              ],
            ),
          )
        else
          SizedBox(
            height: 220,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: list.length,
              itemBuilder: (context, idx) {
                final prod = list[idx];
                final isSelected = (_selectedAlternatives[index] ?? []).any((element) => element['product_category_id'] == prod['product_category_id']);
                final originalPrice = double.tryParse(prod['price'].toString()) ?? 0.0;
                final discountPercent = double.tryParse(prod['discount_percentage']?.toString() ?? '') ?? 0.0;
                final discountedPrice = originalPrice * (1 - (discountPercent / 100));
                final hasDiscount = discountPercent > 0;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        _selectedAlternatives[index]?.removeWhere((element) => element['product_category_id'] == prod['product_category_id']);
                      } else {
                        // For simplicity, allow one alternative per item or toggle
                        _selectedAlternatives[index] = [prod];
                      }
                    });
                  },
                  child: Container(
                    width: 160,
                    margin: const EdgeInsets.only(right: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: isSelected ? Border.all(color: const Color(0xFF166534), width: 2) : null,
                    ),
                    child: Stack(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Stack(
                                  children: [
                                    Container(
                                      width: double.infinity,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF9FAFB),
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: prod['category_image'] != null
                                        ? ClipRRect(
                                            borderRadius: BorderRadius.circular(16),
                                            child: SafeNetworkImage(
                                              imageUrl: ApiService.getImageUrl(prod['category_image']),
                                              fit: BoxFit.cover,
                                            ),
                                          )
                                        : const Icon(Icons.image_outlined, color: Colors.grey),
                                    ),
                                    // Discount Badge
                                    if (hasDiscount)
                                      Positioned(
                                        top: 8,
                                        right: 8,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFE74C3C),
                                            borderRadius: BorderRadius.circular(8),
                                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)],
                                          ),
                                          child: Text(
                                            '-${discountPercent.toStringAsFixed(0)}%',
                                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white),
                                          ),
                                        ),
                                      ),
                                    // Size Tag on Image
                                    Positioned(
                                      top: 8,
                                      left: 8,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.9),
                                          borderRadius: BorderRadius.circular(8),
                                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)],
                                        ),
                                        child: Text(
                                          prod['size'] ?? '',
                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF1F2937)),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 12),
                              // Category
                              Text(
                                (prod['product_category_name'] ?? '').toUpperCase(),
                                style: const TextStyle(fontSize: 10, color: Color(0xFF9CA3AF), fontWeight: FontWeight.w900, letterSpacing: 0.5),
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              // Price
                              if (hasDiscount) ...[
                                Row(
                                  children: [
                                    Text(
                                      '${originalPrice.toStringAsFixed(0)}',
                                      style: const TextStyle(
                                        fontSize: 12, 
                                        color: Colors.grey, 
                                        decoration: TextDecoration.lineThrough,
                                        fontWeight: FontWeight.w600
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${discountedPrice.toStringAsFixed(0)} EGP',
                                      style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFE74C3C), fontSize: 16),
                                    ),
                                  ],
                                ),
                              ] else ...[
                                Text(
                                  '${originalPrice.toStringAsFixed(0)} EGP',
                                  style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF059669), fontSize: 16),
                                ),
                              ],
                              const SizedBox(height: 8),
                              // Store
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(6)),
                                    child: const Icon(Icons.storefront_outlined, size: 12, color: Color(0xFF166534)),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      '${prod['store_name']} • ${prod['store_location'] ?? 'Main Branch'}',
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF4B5563), fontWeight: FontWeight.w700),
                                      maxLines: 2,
                                      overflow: TextOverflow.fade,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        if (isSelected)
                          Positioned(
                            top: 8,
                            right: 8,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(color: Color(0xFF166534), shape: BoxShape.circle),
                              child: const Icon(Icons.check, color: Colors.white, size: 14),
                            ),
                          )
                        else
                          Positioned(
                            top: 8,
                            right: 8,
                            child: Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey.shade300, width: 2),
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _selectedAlternatives.values.any((list) => list.isNotEmpty)
                  ? _continueToSummary
                  : null,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18),
                backgroundColor: const Color(0xFF4A90E2),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Continue to Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(width: 8),
                  Icon(Icons.chevron_right),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.pop(context),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18),
                side: const BorderSide(color: Color(0xFFE0F2FE)),
                backgroundColor: const Color(0xFFF0F9FF),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chevron_left, color: Color(0xFF4A90E2)),
                  SizedBox(width: 8),
                  Text('Back', style: TextStyle(color: Color(0xFF4A90E2), fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _continueToSummary() {
    double totalPrice = 0;
    _selectedAlternatives.forEach((key, list) {
      for (var item in list) {
        final originalPrice = double.tryParse(item['price'].toString()) ?? 0.0;
        final discountPercent = double.tryParse(item['discount_percentage']?.toString() ?? '') ?? 0.0;
        final discountedPrice = originalPrice * (1 - (discountPercent / 100));
        totalPrice += discountedPrice;
      }
    });

    double budget = double.tryParse(widget.requestData['budget'].toString()) ?? 0;

    if (totalPrice > budget) {
      showDialog(
        context: context,
        builder: (context) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Color(0xFFFEE2E2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.account_balance_wallet_outlined, color: Color(0xFFEF4444), size: 36),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Budget Exceeded',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
                ),
                const SizedBox(height: 12),
                Text(
                  'Your current selection totals ${totalPrice.toStringAsFixed(2)} EGP, which is over your set budget of ${budget.toStringAsFixed(2)} EGP.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 15, color: Color(0xFF4B5563), height: 1.4),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: const Color(0xFFEF4444),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: const Text('Adjust Selection', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SummaryScreen(
          requestData: widget.requestData,
          selectedAlternatives: _selectedAlternatives,
        ),
      ),
    );
  }
}
