package com.ufb.auth.user_management.service;

public interface StorageService {
    String upload(byte[] bytes, String contentType, String key);
    String presignedUrl(String key);
}
