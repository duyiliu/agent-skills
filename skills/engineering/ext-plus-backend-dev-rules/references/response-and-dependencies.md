# 统一响应与公共依赖规范

## 统一响应

优先使用项目标准响应对象。若项目使用 `ResponseDto`，遵循以下约定。

常见包路径：

```java
ext.plus.common.core.domain.ResponseDto
```

常用方法：

- `ResponseDto.success()`：成功响应，无数据
- `ResponseDto.success(data)`：成功响应，带数据
- `ResponseDto.error()`：错误响应，无消息
- `ResponseDto.error(msg)`：错误响应，带消息
- `ResponseDto.unauthorized()`：未授权
- `ResponseDto.forbidden()`：权限不足
- `ResponseDto.notfound()`：服务未找到
- `ResponseDto.rateLimited()`：限流

使用示例：

```java
return ResponseDto.success(data);
return ResponseDto.success();
throw new BusinessException("业务错误");
```

## 状态码

- 200：操作成功
- 201：对象创建成功
- 204：操作成功无返回数据
- 400：参数错误
- 401：未授权
- 403：权限不足
- 404：资源或服务未找到
- 405：不允许的 HTTP 方法
- 409：资源冲突
- 415：不支持的数据或媒体类型
- 429：限流
- 500：系统内部错误

## 业务异常

- 业务规则不满足时抛出 `BusinessException`
- 不要用 `null`、`false` 或空对象表达明确业务失败
- 异常消息面向用户，避免暴露内部实现细节

## 常见公共类

- `ResponseDto`：统一响应对象
- `BusinessException`：业务异常
- `WebDatasourceController`：统一控制器基类
- `ServiceImpl`：MyBatis-Plus 服务实现基类
