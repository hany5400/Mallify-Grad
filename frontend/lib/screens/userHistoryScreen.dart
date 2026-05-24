import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/apiService.dart';

class UserHistoryScreen extends StatefulWidget {
  final String? initialSearchQuery;
  const UserHistoryScreen({Key? key, this.initialSearchQuery}) : super(key: key);

  @override
  State<UserHistoryScreen> createState() => _UserHistoryScreenState();
}

class _UserHistoryScreenState extends State<UserHistoryScreen> {
  List<dynamic> _allRequests = [];
  List<dynamic> _filteredRequests = [];
  bool _isLoading = true;
  final Set<int> _expandedIndices = {};
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.initialSearchQuery != null) {
      _searchController.text = widget.initialSearchQuery!;
    }
    _loadHistory();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService.getUserHistory();
      if (response['ok'] == true) {
        _allRequests = response['data'] ?? [];
        _applyFilter();
      }
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  void _applyFilter() {
    final query = _searchController.text.trim().toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredRequests = List.from(_allRequests);
      } else {
        _filteredRequests = _allRequests.asMap().entries.where((entry) {
          final index = entry.key + 1;
          final req = entry.value;
          final budget = req['budget']?.toString() ?? '';
          final dateStr = req['published_at'] != null 
              ? DateFormat('MMM d, yyyy').format(DateTime.parse(req['published_at'].toString())).toLowerCase()
              : 'recently';
          
          final matchesRequestName = 'request #$index'.contains(query);
          final matchesBudget = budget.contains(query);
          final matchesDate = dateStr.contains(query);

          final List<dynamic> items = req['items'] ?? [];
          final matchesItems = items.any((item) {
            final name = (item['product_name'] ?? '').toString().toLowerCase();
            final category = (item['product_category_name'] ?? '').toString().toLowerCase();
            final store = (item['store_name'] ?? '').toString().toLowerCase();
            return name.contains(query) || category.contains(query) || store.contains(query);
          });

          return matchesRequestName || matchesBudget || matchesDate || matchesItems;
        }).map((entry) => entry.value).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Request History',
          style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),
      body: Stack(
        children: [
          // Background pattern
          Positioned.fill(
            child: Image.asset(
              'assets/images/clothes bg.png',
              fit: BoxFit.cover,
              opacity: const AlwaysStoppedAnimation(0.2),
            ),
          ),
          Column(
            children: [
              // Search Bar Container
              Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: TextField(
                  controller: _searchController,
                  onChanged: (_) => _applyFilter(),
                  decoration: InputDecoration(
                    hintText: 'Search requests, items, or stores...',
                    hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                    prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF94A3B8)),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, color: Color(0xFF64748B)),
                            onPressed: () {
                              _searchController.clear();
                              _applyFilter();
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),

              // History List
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
                    : _filteredRequests.isEmpty
                        ? _buildEmptyState()
                        : ListView.builder(
                            padding: const EdgeInsets.all(20),
                            physics: const BouncingScrollPhysics(),
                            itemCount: _filteredRequests.length,
                            itemBuilder: (context, idx) {
                              final req = _filteredRequests[idx];
                              // Find original index for display
                              final originalIndex = _allRequests.indexOf(req) + 1;
                              return _buildHistoryCard(originalIndex, req);
                            },
                          ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history_toggle_off_rounded, size: 70, color: const Color(0xFF94A3B8).withOpacity(0.6)),
          const SizedBox(height: 16),
          const Text(
            'No requests found',
            style: TextStyle(color: Color(0xFF475569), fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try searching for something else.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(int displayIndex, dynamic req) {
    List<dynamic> items = req['items'] ?? [];
    double budget = double.tryParse(req['budget']?.toString() ?? '0') ?? 0;
    bool isExpanded = _expandedIndices.contains(displayIndex);
    
    String dateStr = req['published_at'] != null 
      ? DateFormat('MMM d, yyyy').format(DateTime.parse(req['published_at'].toString()))
      : 'Recently';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        children: [
          // Header
          InkWell(
            onTap: () {
              setState(() {
                if (isExpanded) {
                  _expandedIndices.remove(displayIndex);
                } else {
                  _expandedIndices.add(displayIndex);
                }
              });
            },
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Request #$displayIndex',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        dateStr,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Text(
                        'EGP ${budget.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(width: 12),
                      Icon(
                        isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                        size: 22,
                        color: const Color(0xFF94A3B8),
                      ),
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
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                ),
                const SizedBox(height: 4),
                Text(
                  '${item['product_category_name'] ?? 'Item'} • ${item['store_name'] ?? 'Store'}',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 2),
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
}
