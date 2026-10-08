---
name: ext-plus-backend-dev-rules
description: Ext Plus 框架后端开发规则规范。Use when writing or reviewing Ext Plus based Spring Boot, Dubbo, MyBatis-Plus backend code, controllers, services, mappers, entities, transactions, exceptions, logs, ResponseDto/BusinessException usage, SQL/XML, or security-sensitive backend code.
---

# Ext Plus Backend Dev Rules

## Instructions

- 改动前先查看当前项目已有代码风格，以现有实现为准。
- Controller 只做入参、校验触发和服务调用，业务逻辑放到 Service。
- 修改类操作必须加 `@Transactional(rollbackFor = Exception.class)`。
- 禁止空 `catch`；异常必须处理、记录或重新抛出。
- 禁止 SQL 拼接；MyBatis XML 使用 `#{}` 参数化。
- Mapper/XML 禁止 `select *`，只查需要字段。
- 禁止魔法值，使用常量、枚举或字典。
- 日志中禁止输出密码、Token、身份证、手机号等敏感明文。
- 分页对外返回 `IPage`，不要把具体 `Page` 作为接口返回类型。

## Reference Selection

- 全局规则、命名、包结构：`references/core.md`
- Controller、REST、参数校验：`references/controller.md`
- Service、事务、异常、日志：`references/service.md`
- Mapper、MyBatis XML、SQL、性能：`references/mapper.md`
- Entity、字段、注解、TypeHandler：`references/entity.md`
- 安全编码：`references/security.md`
- ResponseDto、BusinessException、公共依赖：`references/response-and-dependencies.md`