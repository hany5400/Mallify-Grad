import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import '../services/apiService.dart';
import 'homeScreen.dart';
import 'main_screen.dart';

class AuthScreen extends StatefulWidget {
  final bool initialLogin;
  const AuthScreen({Key? key, this.initialLogin = true}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  late bool _isLogin;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _isLogin = widget.initialLogin;
  }

  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _dobController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String _selectedGender = 'male';

  void _toggleAuthMode() {
    setState(() {
      _isLogin = !_isLogin;
      _formKey.currentState?.reset();
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_isLogin && _passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      Map<String, dynamic> response;

      if (_isLogin) {
        response = await ApiService.smartLogin(
          _emailController.text,
          _passwordController.text,
        );
      } else {
        response = await ApiService.userRegister(
          name: _nameController.text,
          email: _emailController.text,
          password: _passwordController.text,
          gender: _selectedGender,
          dob: _dobController.text,
        );
      }

      if (!mounted) return;

      if (response['ok'] == true) {
        if (_isLogin) {
          final String role = response['role'] ?? 'user';
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => MainScreen(role: role)),
          );
        } else {
          await ApiService.setNewUserFlag(true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Registration Successful! Please login.'),
              backgroundColor: Colors.green,
            ),
          );
          _toggleAuthMode();
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'An error occurred'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      
      // Force account selection dialog by signing out of the previous session
      try {
        await googleSignIn.signOut();
        await FirebaseAuth.instance.signOut();
      } catch (_) {}

      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      
      if (googleUser == null) {
        setState(() => _isLoading = false);
        return;
      }
      
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      
      final UserCredential userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
      final User? firebaseUser = userCredential.user;
      
      if (firebaseUser == null) {
        throw Exception('Firebase authentication failed');
      }
      
      final response = await ApiService.googleSignIn(
        firebaseUser.email ?? googleUser.email,
        firebaseUser.displayName ?? googleUser.displayName ?? 'Google User',
        firebaseUser.uid,
      );
      
      if (!mounted) return;
      
      if (response['ok'] == true) {
        final String role = response['role'] ?? 'user';
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => MainScreen(role: role)),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'An error occurred during Google Sign-In'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Google Sign-In Error: ${e.toString()}'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signInWithFacebook() async {
    setState(() => _isLoading = true);
    try {
      // Force logout of previous Facebook session to show login prompt
      try {
        await FacebookAuth.instance.logOut();
        await FirebaseAuth.instance.signOut();
      } catch (_) {}

      final LoginResult loginResult = await FacebookAuth.instance.login(
        permissions: ['public_profile', 'email'],
      );

      if (loginResult.status == LoginStatus.success) {
        final AccessToken accessToken = loginResult.accessToken!;
        final OAuthCredential credential = FacebookAuthProvider.credential(accessToken.token);
        
        final UserCredential userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
        final User? firebaseUser = userCredential.user;

        if (firebaseUser == null) {
          throw Exception('Firebase authentication failed');
        }

        final String email = firebaseUser.email ?? '';
        String finalEmail = email;
        if (finalEmail.isEmpty) {
          try {
            final userData = await FacebookAuth.instance.getUserData();
            finalEmail = userData['email'] ?? '';
          } catch (_) {}
        }

        final response = await ApiService.facebookSignIn(
          finalEmail,
          firebaseUser.displayName ?? 'Facebook User',
          firebaseUser.uid,
        );

        if (!mounted) return;

        if (response['ok'] == true) {
          final String role = response['role'] ?? 'user';
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => MainScreen(role: role)),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? 'An error occurred during Facebook Sign-In'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } else if (loginResult.status == LoginStatus.cancelled) {
        setState(() => _isLoading = false);
      } else {
        throw Exception(loginResult.message ?? 'Facebook login failed');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Facebook Sign-In Error: ${e.toString()}'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _selectDate() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime(2000),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (pickedDate != null) {
      setState(() {
        _dobController.text = "${pickedDate.toLocal()}".split(' ')[0];
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _dobController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Background Image
          Positioned.fill(
            child: Image.asset(
              'assets/images/clothes bg.png',
              fit: BoxFit.cover,
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
                physics: const BouncingScrollPhysics(),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 20),
                      Text(
                        _isLogin ? 'Welcome Back' : 'Create Account',
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _isLogin ? 'Sign in to continue shopping' : 'Join Mallify and start saving',
                        style: const TextStyle(fontSize: 16, color: Color(0xFF6B7280)),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 48),

                      if (!_isLogin) ...[
                        _buildLabeledField(
                          label: 'Full Name',
                          child: TextFormField(
                            controller: _nameController,
                            decoration: _inputDecoration('Enter your name', Icons.person_outline),
                            validator: (value) => value!.isEmpty ? 'Please enter your name' : null,
                          ),
                        ),
                        const SizedBox(height: 24),
                        _buildLabeledField(
                          label: 'Gender',
                          child: DropdownButtonFormField<String>(
                            value: _selectedGender,
                            decoration: _inputDecoration('Select gender', Icons.wc),
                            items: const [
                              DropdownMenuItem(value: 'male', child: Text('Male')),
                              DropdownMenuItem(value: 'female', child: Text('Female')),
                            ],
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedGender = val);
                            },
                          ),
                        ),
                        const SizedBox(height: 24),
                        _buildLabeledField(
                          label: 'Date of Birth',
                          child: TextFormField(
                            controller: _dobController,
                            readOnly: true,
                            onTap: _selectDate,
                            decoration: _inputDecoration('Select your Date', Icons.calendar_today_outlined),
                            validator: (value) => value!.isEmpty ? 'Please select your DOB' : null,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],

                      _buildLabeledField(
                        label: 'Email',
                        child: TextFormField(
                          controller: _emailController,
                          decoration: _inputDecoration('Enter your email', Icons.email_outlined),
                          keyboardType: TextInputType.emailAddress,
                          validator: (value) =>
                              value!.contains('@') ? null : 'Please enter a valid email',
                        ),
                      ),
                      const SizedBox(height: 24),

                      _buildLabeledField(
                        label: 'Password',
                        child: TextFormField(
                          controller: _passwordController,
                          decoration: _inputDecoration('Enter your password', Icons.lock_outline),
                          obscureText: true,
                          validator: (value) =>
                              value!.length < 6 ? 'Password must be at least 6 characters' : null,
                        ),
                      ),

                      if (!_isLogin) ...[
                        const SizedBox(height: 24),
                        _buildLabeledField(
                          label: 'Confirm Password',
                          child: TextFormField(
                            controller: _confirmPasswordController,
                            decoration: _inputDecoration('Re-enter your password', Icons.lock_clock_outlined),
                            obscureText: true,
                            validator: (value) {
                              if (value!.isEmpty) return 'Please confirm your password';
                              if (value != _passwordController.text) return 'Passwords do not match';
                              return null;
                            },
                          ),
                        ),
                      ],

                      const SizedBox(height: 40),
                      ElevatedButton(
                        onPressed: _isLoading ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF3B82F6),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 18),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : Text(
                                _isLogin ? 'Log In' : 'Sign Up',
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                      ),
                      if (_isLogin) ...[
                        const SizedBox(height: 32),
                        Row(
                          children: [
                            const Expanded(
                              child: Divider(
                                color: Color(0xFFE5E7EB),
                                thickness: 1,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text(
                                'or continue with',
                                style: TextStyle(
                                  color: const Color(0xFF9CA3AF),
                                  fontSize: 14,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ),
                            const Expanded(
                              child: Divider(
                                color: Color(0xFFE5E7EB),
                                thickness: 1,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Google Button
                            Expanded(
                              child: OutlinedButton(
                                onPressed: _isLoading ? null : _signInWithGoogle,
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFFE5E7EB)),
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  backgroundColor: Colors.white,
                                  elevation: 0,
                                ),
                                child: Image.asset(
                                  'assets/images/google_logo.png',
                                  height: 24,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Facebook Button
                            Expanded(
                              child: OutlinedButton(
                                onPressed: _isLoading ? null : _signInWithFacebook,
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFFE5E7EB)),
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  backgroundColor: Colors.white,
                                  elevation: 0,
                                ),
                                child: Container(
                                  width: 24,
                                  height: 24,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF1877F2),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'f',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        fontFamily: 'sans-serif',
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Apple Button (Mockup placeholder)
                            Expanded(
                              child: OutlinedButton(
                                onPressed: _isLoading ? null : () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Apple Sign-In is coming soon!'),
                                      backgroundColor: Colors.black,
                                    ),
                                  );
                                },
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFFE5E7EB)),
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  backgroundColor: Colors.white,
                                  elevation: 0,
                                ),
                                child: const Icon(
                                  Icons.apple,
                                  color: Colors.black,
                                  size: 28,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _isLogin ? "Don't have an account?" : 'Already have an account?',
                            style: const TextStyle(color: Color(0xFF6B7280)),
                          ),
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: _isLoading ? null : _toggleAuthMode,
                            child: Text(
                              _isLogin ? 'Sign up' : 'Log in',
                              style: const TextStyle(
                                color: Color(0xFF3B82F6),
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          // Back Button
          Positioned(
            top: 12,
            left: 12,
            child: SafeArea(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.8),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF1F2937), size: 20),
                  onPressed: () {
                    if (Navigator.canPop(context)) Navigator.pop(context);
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabeledField({required String label, required Widget child}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: Color(0xFF4B5563),
            ),
          ),
        ),
        child,
      ],
    );
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
      prefixIcon: Icon(icon, color: const Color(0xFF9CA3AF), size: 22),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 1.5),
      ),
      filled: true,
      fillColor: const Color(0xFFF9FAFB),
    );
  }
}
