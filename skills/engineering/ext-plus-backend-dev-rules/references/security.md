# 安全编码规范

适用于 SQL、认证、权限、文件上传、敏感数据、异常返回等安全相关后端代码。

## SQL 注入防护

- SQL 使用 `#{}` 参数化
- 禁止直接拼接 SQL
- 禁止无校验使用 `${}`
- 动态表名、排序字段、列名必须做白名单校验

```java
List<String> allowedColumns = Arrays.asList("create_time", "update_time", "id");
if (!allowedColumns.contains(orderBy)) {
    throw new BusinessException("非法的排序字段");
}
```

## 密码安全

- 密码必须加密存储
- 登录校验使用密码编码器匹配
- 禁止明文保存、返回或打印密码

```java
user.setPassword(passwordEncoder.encode(dto.getPassword()));
passwordEncoder.matches(rawPassword, user.getPassword());
```

## 敏感数据脱敏

- 响应中的身份证、手机号、银行卡等敏感字段按项目规范脱敏
- 日志中禁止输出密码、Token、身份证、手机号等敏感明文

```java
log.info("保存用户, 姓名: {}, 身份证: {}", name, DesensitizedUtil.idCardNum(idCard, 6, 4));
```

## XSS 与输入校验

- 用户输入必须校验长度、格式、枚举范围
- 富文本或可显示内容按项目规范过滤或转义
- 检测到 `<script>`、`javascript:`、事件属性等危险内容时拒绝

## 访问控制

- 敏感接口添加功能权限，例如 `@PreAuthorize`
- 查询、修改、删除具体数据时校验数据权限
- 越权访问抛出业务异常或权限异常

## 文件上传

- 校验文件大小
- 校验扩展名和 MIME 类型
- 使用 UUID 或业务安全规则重命名
- 禁止使用原始文件名直接作为存储路径
- 禁止上传可执行脚本或危险类型

## 异常信息

- 业务异常返回明确友好提示
- 系统异常返回通用提示
- 不向前端暴露堆栈、SQL、内部路径、配置、密钥等信息
