# 核心后端开发规范

## 技术栈

- Spring Boot + Dubbo + MyBatis-Plus
- 统一响应优先使用项目标准响应对象，例如 `ResponseDto`
- 分页对外返回接口类型 `IPage`，不要把具体实现 `Page` 作为接口返回类型
- Controller 按项目既有模式继承或使用统一控制器基类
- Service 实现类继承 `ServiceImpl<XxxMapper, Xxx>`

## 6 条硬性规则

1. 禁用基本类型：实体、DTO、BO、业务参数优先使用 `Long`、`Integer`、`Boolean`，不要使用 `long`、`int`、`boolean`
2. 禁用魔法值：使用常量、枚举或字典
3. 修改类操作必须加 `@Transactional(rollbackFor = Exception.class)`
4. 禁止空 `catch`：必须记录日志、抛出业务异常或明确处理
5. 关键操作必须记录日志，类上使用 `@Slf4j`
6. 禁止 SQL 字符串拼接，MyBatis XML 使用 `#{}` 参数化

## 命名规范

- 类名：大驼峰，如 `Order`、`UserProfile`
- 方法/变量：小驼峰，如 `userName`、`saveOrder()`
- 常量：全大写下划线，如 `DEFAULT_STATUS`
- 布尔字段：使用 `is`/`has` 前缀，如 `isComplete`、`hasPermission`
- 日期字段：业务语义 + `Date`/`Time`，如 `orderDate`、`createTime`

## 常见包结构

```text
modules.{模块}/controller
modules.{模块}/service
modules.{模块}/service/impl
modules.{模块}/mapper
modules.{模块}/model/entity
modules.{模块}/model/dto
modules.{模块}/model/bo
```

## Git 提交

```text
feat|fix|docs|style|refactor: 描述
```
