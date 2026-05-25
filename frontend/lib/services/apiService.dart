import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulator, or localhost/127.0.0.1 for Web/Windows
  static const String baseUrl = 'https://pretended-squander-unlivable.ngrok-free.dev';

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // --- SMART LOGIN (Recognizes role automatically) ---
  static Future<Map<String, dynamic>> smartLogin(String email, String password) async {
    var response = await userLogin(email, password);
    if (response['ok'] == true) {
      response['role'] = response['role'] ?? 'user';
      return response;
    }

    var adminResponse = await adminLogin(email, password);
    if (adminResponse['ok'] == true) {
      adminResponse['role'] = adminResponse['data']['admin']?['admin_type'] ?? 'admin';
      return adminResponse;
    }

    return {'ok': false, 'message': 'Invalid email or password.'};
  }

  // --- USER AUTHENTICATION & PROFILE ---

  static Future<Map<String, dynamic>> userLogin(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'email': email, 'password': password}),
      );
      
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['ok'] == true) {
        await _saveToken(data['token']);
      }
      return data;
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> googleSignIn(String email, String name, String googleId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/google'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'email': email,
          'name': name,
          'googleId': googleId,
        }),
      );
      
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['ok'] == true) {
        await _saveToken(data['token']);
      }
      return data;
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> facebookSignIn(String email, String name, String facebookId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/facebook'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'email': email,
          'name': name,
          'facebookId': facebookId,
        }),
      );
      
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['ok'] == true) {
        await _saveToken(data['token']);
      }
      return data;
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> userRegister({
    required String name,
    required String email,
    required String password,
    required String gender,
    required String dob,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'gender': gender,
          'DOB': dob,
        }),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/me'),
        headers: await _headers(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> updateProfile({String? name, String? gender, String? dob}) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/users/update-profile'),
        headers: await _headers(),
        body: jsonEncode({
          if (name != null) 'name': name,
          if (gender != null) 'gender': gender,
          if (dob != null) 'DOB': dob,
        }),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> updateAvatar(String filePath) async {
    try {
      final token = await getToken();
      var request = http.MultipartRequest('PATCH', Uri.parse('$baseUrl/users/avatar'));
      request.headers['Authorization'] = 'Bearer $token';
      request.files.add(await http.MultipartFile.fromPath('avatar', filePath));

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> deleteAvatar() async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/users/avatar'),
        headers: await _headers(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> changePassword(String newPassword) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/users/change-password'),
        headers: await _headers(),
        body: jsonEncode({
          'newPassword': newPassword,
        }),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> getUserHistory({String? limit}) async {
    try {
      final url = limit != null
          ? '$baseUrl/userRequest/history?limit=$limit'
          : '$baseUrl/userRequest/history';
      final response = await http.get(
        Uri.parse(url),
        headers: await _headers(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  // --- ADMIN AUTHENTICATION ---

  static Future<Map<String, dynamic>> adminLogin(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/admins/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'email': email, 'password': password}),
      );
      
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['token'] != null) {
        await _saveToken(data['token']);
        return {'ok': true, 'data': data};
      } else {
        return {'ok': false, 'message': data['message'] ?? 'Login failed'};
      }
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  // --- MALLS & DISCOVERY ---

  static Future<List<dynamic>> getAllMalls() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/mall'),
        headers: await _headers(),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<List<dynamic>> getAllPublicDiscounts() async {
    try {
      final url = Uri.parse('$baseUrl/discount/public');
      final response = await http.get(
        url,
        headers: await _headers(),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    // Ensure relative paths from backend (uploads/...) work
    return '$baseUrl/$path';
  }

  static Future<Map<String, dynamic>> findMatches(Map<String, dynamic> filters) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/userRequest/find-matches'),
        headers: await _headers(),
        body: jsonEncode(filters),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> submitFinalRequest(Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/userRequest/final-submit'),
        headers: await _headers(),
        body: jsonEncode(data),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> checkSubscriptionLimit() async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/userRequest/check-subscription'),
        headers: await _headers(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> processPayment(double amount, String method, double durationMonths) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/payment/process'),
        headers: await _headers(),
        body: jsonEncode({
          'amount': amount,
          'method': method,
          'duration_months': durationMonths,
        }),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> checkPremiumStatus() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payment/status'), // I'll create this endpoint
        headers: await _headers(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'ok': false, 'message': 'Network error: $e'};
    }
  }

  static Future<List<dynamic>> getNotifications() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications'),
        headers: await _headers(),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // --- TOKEN UTILS ---

  static Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
  }

  // --- NEW USER TRACKING ---
  static Future<void> setNewUserFlag(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_new_user', value);
  }

  static Future<bool> getIsNewUserFlag() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('is_new_user') ?? false;
  }
}
