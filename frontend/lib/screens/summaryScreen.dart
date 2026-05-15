import 'package:flutter/material.dart';
import '../services/apiService.dart';
import 'main_screen.dart';

class SummaryScreen extends StatefulWidget {
  final Map<String, dynamic> requestData;
  final Map<int, dynamic> selectedAlternatives;

  const SummaryScreen({
    Key? key,
    required this.requestData,
    required this.selectedAlternatives,
  }) : super(key: key);

  @override
  State<SummaryScreen> createState() => _SummaryScreenState();
}

class _SummaryScreenState extends State<SummaryScreen> {
  bool _isSubmitting = false;

  double get _totalBudget => double.tryParse(widget.requestData['budget'].toString()) ?? 0.0;
  
  double get _totalSelected {
    double total = 0;
    widget.selectedAlternatives.forEach((key, list) {
      if (list is List) {
        for (var value in list) {
          final originalPrice = double.tryParse(value['price'].toString()) ?? 0.0;
          final discountPercent = double.tryParse(value['discount_percentage']?.toString() ?? '') ?? 0.0;
          final discountedPrice = originalPrice * (1 - (discountPercent / 100));
          total += discountedPrice;
        }
      }
    });
    return total;
  }

  double get _totalOriginal {
    double total = 0;
    widget.selectedAlternatives.forEach((key, list) {
      if (list is List) {
        for (var value in list) {
          total += double.tryParse(value['price'].toString()) ?? 0.0;
        }
      }
    });
    return total;
  }

  double get _remainingBudget => _totalBudget - _totalSelected;
  
  // Calculate points based on total spent (e.g., 10% of total selected)
  int get _calculatedPoints => (_totalSelected * 0.05).round();

  @override
  Widget build(BuildContext context) {
    final items = widget.requestData['items'] as List;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Summary', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
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
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Summary',
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Review your selected items before confirming',
                        style: TextStyle(color: Colors.grey, fontSize: 16),
                      ),
                      const SizedBox(height: 32),

                      ...List.generate(items.length, (index) {
                        final selected = widget.selectedAlternatives[index];
                        return _buildSelectedItemCard(index, items[index], selected);
                      }),

                      const SizedBox(height: 24),
                      _buildBudgetSummary(),
                      const SizedBox(height: 24),
                      _buildPointsCard(),
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

  Widget _buildSelectedItemCard(int index, dynamic itemInfo, dynamic selectedList) {
    final List selections = selectedList is List ? selectedList : [];
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
                  style: const TextStyle(color: Color(0xFF0284C7), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                itemInfo['search'] ?? 'Item ${index + 1}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF374151)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (selections.isEmpty)
             const Text("No alternatives selected for this item.", style: TextStyle(color: Colors.redAccent, fontSize: 13))
          else
            ...selections.map((selected) => Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: selected['category_image'] != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              ApiService.getImageUrl(selected['category_image']),
                              fit: BoxFit.cover,
                            ),
                          )
                        : const Icon(Icons.image_outlined, color: Colors.grey),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          selected['store_name'],
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        Wrap(
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            if ((double.tryParse(selected['discount_percentage']?.toString() ?? '') ?? 0) > 0) ...[
                              Text(
                                '${selected['price']}',
                                style: const TextStyle(
                                  fontSize: 12, 
                                  color: Colors.grey, 
                                  decoration: TextDecoration.lineThrough,
                                  fontWeight: FontWeight.w600
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '${(double.parse(selected['price'].toString()) * (1 - (double.parse(selected['discount_percentage'].toString()) / 100))).toStringAsFixed(0)} EGP',
                                style: const TextStyle(color: Color(0xFFE74C3C), fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ] else ...[
                              Text(
                                '${selected['price']} EGP',
                                style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ],
                            const SizedBox(width: 8),
                            Text(
                              '(${selected['product_category_name']} - ${selected['size']})',
                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                        Text(
                          '${selected['mall_name']} - ${selected['store_location']}',
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )).toList(),
        ],
      ),
    );
  }

  Widget _buildBudgetSummary() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Budget Summary',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 20),
          _buildBudgetRow('Total Budget', '${_totalBudget.toStringAsFixed(0)} EGP'),
          const SizedBox(height: 16),
          _buildBudgetRow('Total Cost', '${_totalSelected.toStringAsFixed(0)} EGP'),
          if (_totalOriginal > _totalSelected) ...[
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('You Saved', style: TextStyle(color: Color(0xFF059669), fontSize: 15, fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(8)),
                  child: Text(
                    '${(_totalOriginal - _totalSelected).toStringAsFixed(0)} EGP',
                    style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ],
            ),
          ],
          const Divider(height: 32),
          _buildBudgetRow(
            'Remaining Budget', 
            '${_remainingBudget.toStringAsFixed(0)} EGP',
            valueColor: const Color(0xFFEF4444),
          ),
        ],
      ),
    );
  }

  Widget _buildBudgetRow(String label, String value, {Color? valueColor, bool strikethrough = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 15, fontWeight: FontWeight.w500)),
        Text(
          value, 
          style: TextStyle(
            fontWeight: FontWeight.w900, 
            fontSize: 16, 
            color: valueColor ?? const Color(0xFF1F2937),
            decoration: strikethrough ? TextDecoration.lineThrough : null,
          ),
        ),
      ],
    );
  }

  Widget _buildPointsCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFDCFCE7)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(color: Color(0xFFBBF7D0), shape: BoxShape.circle),
            child: const Icon(Icons.card_giftcard, color: Color(0xFF166534), size: 24),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('You will earn', style: TextStyle(color: Color(0xFF166534), fontSize: 14)),
              Text(
                '+$_calculatedPoints Points', 
                style: const TextStyle(color: Color(0xFF166534), fontWeight: FontWeight.w900, fontSize: 18),
              ),
            ],
          ),
        ],
      ),
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
              onPressed: _isSubmitting ? null : _submitFinal,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18),
                backgroundColor: const Color(0xFF4A90E2),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: _isSubmitting
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Finish Request', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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

  Future<void> _submitFinal() async {
    setState(() => _isSubmitting = true);
    
    final List selectedItems = [];
    widget.selectedAlternatives.forEach((key, list) {
      if (list is List) {
        for (var value in list) {
          final originalPrice = double.tryParse(value['price'].toString()) ?? 0.0;
          final discountPercent = double.tryParse(value['discount_percentage']?.toString() ?? '') ?? 0.0;
          final discountedPrice = originalPrice * (1 - (discountPercent / 100));
          
          // Create a copy and update the price to the discounted one for backend storage
          final itemCopy = Map<String, dynamic>.from(value);
          itemCopy['price'] = discountedPrice;
          selectedItems.add(itemCopy);
        }
      }
    });

    final payload = {
      'budget': widget.requestData['budget'],
      'mall_id': widget.requestData['mall_id'],
      'points_earned': _calculatedPoints,
      'items': selectedItems,
    };

    final response = await ApiService.submitFinalRequest(payload);

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (response['ok'] == true) {
        Navigator.pushAndRemoveUntil(
          context, 
          MaterialPageRoute(builder: (context) => const MainScreen(role: 'user', showSuccessMessage: true)), 
          (route) => false
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response['message'] ?? 'Submission failed'), backgroundColor: Colors.red),
        );
      }
    }
  }
}
