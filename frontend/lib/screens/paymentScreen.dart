import 'package:flutter/material.dart';
import '../services/apiService.dart';
import 'dart:ui';
import 'package:flutter/services.dart';
import 'main_screen.dart';

/// Auto-formats expiry date as MM/YY.
/// - Inserts "/" automatically after the 2 month digits.
/// - Blocks further input until "/" is present.
class ExpiryDateInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    // Strip everything except digits
    final digits = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');

    // Build formatted string
    String formatted = '';
    if (digits.length >= 2) {
      formatted = digits.substring(0, 2) + '/' + digits.substring(2);
    } else {
      formatted = digits;
    }

    // Clamp to MM/YY (5 chars)
    if (formatted.length > 5) {
      formatted = formatted.substring(0, 5);
    }

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

class PaymentScreen extends StatefulWidget {
  final String planTitle;
  final String price;
  final double durationMonths;

  const PaymentScreen({Key? key, required this.planTitle, required this.price, required this.durationMonths}) : super(key: key);

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  bool _isProcessing = false;
  String _selectedMethod = 'Visa Card';
  late double _currentDuration;
  final double _basePricePerMonth = 499.0;

  // Controllers for validation
  final TextEditingController _cardNoController = TextEditingController();
  final TextEditingController _expiryController = TextEditingController();
  final TextEditingController _cvvController = TextEditingController();
  final TextEditingController _instaPayController = TextEditingController();
  final TextEditingController _walletController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _currentDuration = widget.durationMonths;
  }

  @override
  void dispose() {
    _cardNoController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    _instaPayController.dispose();
    _walletController.dispose();
    super.dispose();
  }

  final List<Map<String, dynamic>> _paymentMethods = [
    {'name': 'Visa Card', 'icon': Icons.credit_card_rounded, 'color': const Color(0xFF4A90E2)},
    {'name': 'InstaPay', 'imagePath': 'assets/images/instapay logo.png', 'color': const Color(0xFF22C55E)},
    {'name': 'Vodafone Cash', 'imagePath': 'assets/images/vodafone logo.webp', 'color': const Color(0xFFE11D48)},
    {'name': 'Orange Cash', 'imagePath': 'assets/images/orange logo.png', 'color': const Color(0xFFF97316)},
  ];

  Future<void> _handlePayment() async {
    // Basic Validation
    if (_selectedMethod == 'Visa Card') {
      if (_cardNoController.text.length < 16) {
        _showError('Please enter a valid 16-digit card number');
        return;
      }
      if (_cvvController.text.length < 3) {
        _showError('Please enter a valid 3-digit CVV');
        return;
      }
    } else if (_selectedMethod == 'Vodafone Cash' || _selectedMethod == 'Orange Cash') {
      String phone = _walletController.text;
      if (phone.length != 11 || !phone.startsWith('01')) {
        _showError('Invalid wallet number. Must be 11 digits and start with 01');
        return;
      }
    } else if (_selectedMethod == 'InstaPay') {
      if (_instaPayController.text.isEmpty) {
        _showError('Please enter your InstaPay address');
        return;
      }
    }

    setState(() => _isProcessing = true);
    
    final amount = _basePricePerMonth * _currentDuration;
    
    final response = await ApiService.processPayment(amount, _selectedMethod, _currentDuration);
    
    setState(() => _isProcessing = false);
    
    if (response['ok'] == true) {
      if (mounted) {
        _showSuccessDialog();
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response['message'] ?? 'Payment failed')),
        );
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.redAccent,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Color(0xFFF0FDF4),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.check_circle_rounded, color: Color(0xFF22C55E), size: 64),
              ),
              const SizedBox(height: 24),
              const Text(
                'Payment Successful!',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
              ),
              const SizedBox(height: 12),
              Text(
                'You are now a Premium member of Mallify. Enjoy unlimited filtering and exclusive offers!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF6B7280), fontSize: 16, height: 1.5),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (context) => const MainScreen(role: 'user')),
                      (route) => false,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: const Color(0xFF4A90E2),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Great!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Checkout', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          // THE BACKGROUND IMAGE - NO FILTERS, FULL VISIBILITY
          Positioned.fill(
            child: Image.asset(
              'assets/images/clothes bg.png',
              fit: BoxFit.cover,
            ),
          ),
          // Subtle overlay only to ensure text is readable
          Positioned.fill(
            child: Container(color: Colors.white.withOpacity(0.2)),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Customize Duration',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.7),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white, width: 2),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, spreadRadius: 5),
                      ],
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Duration:', style: TextStyle(fontSize: 16, color: Color(0xFF6B7280))),
                            Text(
                              _currentDuration == _currentDuration.toInt() 
                                  ? '${_currentDuration.toInt()} Months' 
                                  : '${_currentDuration.toStringAsFixed(1)} Months', 
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF4A90E2)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SliderTheme(
                          data: SliderTheme.of(context).copyWith(
                            activeTrackColor: const Color(0xFF4A90E2),
                            inactiveTrackColor: const Color(0xFFE5E7EB),
                            thumbColor: const Color(0xFF4A90E2),
                            overlayColor: const Color(0xFF4A90E2).withOpacity(0.2),
                            trackHeight: 8,
                          ),
                          child: Slider(
                            value: _currentDuration,
                            min: 0.5,
                            max: 12.0,
                            divisions: 23, // 0.5 month steps
                            onChanged: (value) => setState(() => _currentDuration = value),
                          ),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: const [
                            Text('0.5', style: TextStyle(color: Colors.grey, fontSize: 12)),
                            Text('12', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Order Summary',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3), width: 2),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF3B82F6).withOpacity(0.15), blurRadius: 20, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFF60A5FA), Color(0xFF3B82F6)]),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(color: const Color(0xFF3B82F6).withOpacity(0.4), blurRadius: 10, offset: const Offset(0, 4)),
                            ],
                          ),
                          child: const Icon(Icons.diamond_rounded, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Premium Plan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                              Text('${_currentDuration == _currentDuration.toInt() ? _currentDuration.toInt() : _currentDuration.toStringAsFixed(1)} Months Access', style: const TextStyle(color: Color(0xFF6B7280), fontSize: 13)),
                            ],
                          ),
                        ),
                        Text('${(_basePricePerMonth * _currentDuration).toStringAsFixed(0)} EGP', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF1F2937))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Payment Method',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
                  ),
                  const SizedBox(height: 16),
                  ..._paymentMethods.map((method) => _buildPaymentMethodItem(method)).toList(),
                  const SizedBox(height: 40),
                  const Text(
                  'Payment Details',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
                ),
                const SizedBox(height: 16),
                _buildPaymentDetails(),
                const SizedBox(height: 80),
                ],
              ),
            ),
          ),
          if (_isProcessing)
            Positioned.fill(
              child: Container(
                color: Colors.black.withOpacity(0.5),
                child: const Center(child: CircularProgressIndicator(color: Colors.white)),
              ),
            ),
          ],
        ),
        bottomNavigationBar: _buildPayButton(),
      );
  }

  /// Renders a logo image with a ColorFilter that turns white pixels transparent.
  /// Works by making alpha proportional to (3·A − R − G − B): white → A=0, colours → A≈1.
  Widget _buildLogo(String assetPath, {double size = 44}) {
    return ColorFiltered(
      colorFilter: const ColorFilter.matrix(<double>[
        1, 0, 0, 0, 0,   // R
        0, 1, 0, 0, 0,   // G
        0, 0, 1, 0, 0,   // B
        -1, -1, -1, 3, 0, // A: white → 0, colours → opaque
      ]),
      child: Image.asset(
        assetPath,
        width: size,
        height: size,
        fit: BoxFit.contain,
      ),
    );
  }

  Widget _buildPaymentMethodItem(Map<String, dynamic> method) {
    bool isSelected = _selectedMethod == method['name'];
    final hasImage = method.containsKey('imagePath');
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = method['name']),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.8),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? const Color(0xFF3B82F6) : Colors.white, width: 2),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
            if (isSelected) BoxShadow(color: const Color(0xFF3B82F6).withOpacity(0.15), blurRadius: 15, offset: const Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            if (hasImage)
              _buildLogo(method['imagePath'] as String, size: 44)
            else
              Icon(method['icon'] as IconData, color: method['color'] as Color, size: 28),
            const SizedBox(width: 16),
            Text(method['name'], style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: isSelected ? const Color(0xFF1F2937) : const Color(0xFF6B7280))),
            const Spacer(),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: Color(0xFF4A90E2), size: 24)
            else
              Container(width: 24, height: 24, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFFE5E7EB), width: 2))),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentDetails() {
    if (_selectedMethod == 'Visa Card') {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.6),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white, width: 2),
        ),
        child: Column(
          children: [
            _buildTextField(
              'Card Number', 
              'XXXX XXXX XXXX XXXX', 
              Icons.credit_card_outlined,
              controller: _cardNoController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(16)],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildTextField(
                    'Expiry Date', 
                    'MM/YY', 
                    Icons.calendar_today_outlined,
                    controller: _expiryController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [ExpiryDateInputFormatter()],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildTextField(
                    'CVV', 
                    '***', 
                    Icons.lock_outline_rounded,
                    controller: _cvvController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(3)],
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    } else if (_selectedMethod == 'InstaPay') {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.6),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white, width: 2),
        ),
        child: _buildTextField(
          'InstaPay Address',
          'username@instapay',
          Icons.account_balance_rounded,
          controller: _instaPayController,
          prefixWidget: SizedBox(
            width: 48,
            height: 48,
            child: Center(
              child: _buildLogo('assets/images/instapay logo.png', size: 32),
            ),
          ),
        ),
      );
    } else {
      // Vodafone or Orange Cash
      final logoPath = _selectedMethod == 'Vodafone Cash'
          ? 'assets/images/vodafone logo.webp'
          : 'assets/images/orange logo.png';
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.6),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white, width: 2),
        ),
        child: _buildTextField(
          'Wallet Number',
          '01X XXXX XXXX',
          Icons.phone_android_rounded,
          controller: _walletController,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(11)],
          prefixWidget: SizedBox(
            width: 48,
            height: 48,
            child: Center(
              child: _buildLogo(logoPath, size: 32),
            ),
          ),
        ),
      );
    }
  }

  Widget _buildTextField(
    String label,
    String hint,
    IconData icon, {
    TextEditingController? controller,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    Widget? prefixWidget,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF6B7280))),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          inputFormatters: inputFormatters,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: prefixWidget ?? Icon(icon, size: 20, color: const Color(0xFF4A90E2)),
            filled: true,
            fillColor: Colors.white.withOpacity(0.9),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white, width: 2)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF4A90E2), width: 2)),
            counterText: "",
          ),
        ),
      ],
    );
  }

  Widget _buildPayButton() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: ElevatedButton(
        onPressed: _isProcessing ? null : _handlePayment,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 18),
          backgroundColor: const Color(0xFF4A90E2),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 0,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Pay ${(_basePricePerMonth * _currentDuration).toStringAsFixed(0)} EGP', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(width: 8),
            if (_isProcessing)
              const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            else
              const Icon(Icons.security_rounded, size: 20),
          ],
        ),
      ),
    );
  }
}
