package com.batdongsan.dto.admin;

import com.batdongsan.entity.User;
import java.time.LocalDateTime;

public class AdminUserRes {
    private final Long id; private final String name; private final String email; private final String phone;
    private final String role; private final String status; private final LocalDateTime createdAt;
    public AdminUserRes(User user){id=user.getId();name=user.getName();email=user.getEmail();phone=user.getPhone();
        role=user.getRole().name();status=user.getStatus().name();createdAt=user.getCreatedAt();}
    public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;}
    public String getPhone(){return phone;} public String getRole(){return role;} public String getStatus(){return status;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
