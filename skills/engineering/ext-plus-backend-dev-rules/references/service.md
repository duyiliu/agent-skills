# Service 规范

适用于 `**/service/**/*.java`。

## 基本要求

- Service 实现类使用 `@Slf4j`、`@Service`
- 实现类继承 `ServiceImpl<XxxMapper, Xxx>`
- 依赖注入使用 `@Resource`
- 新增、修改、删除、批量写入等修改操作必须加事务
- 数据不存在、业务规则不满足时抛出 `BusinessException`
- DTO/Entity/BO 转换优先使用 Hutool `BeanUtil`，复杂转换可用 MapStruct（若项目已有）
- 关键业务流程记录 `info`，异常记录 `error` 并带完整堆栈
- 不在日志记录密码、身份证、手机号等敏感明文，必要时脱敏

## 事务

```java
@Override
@Transactional(rollbackFor = Exception.class)
public Long save(XxxDto dto) {
    Xxx entity = BeanUtil.toBean(dto, Xxx.class);
    baseMapper.insert(entity);
    log.info("新增{}: {}", "业务名", entity.getId());
    return entity.getId();
}
```

事务规则：

- 写操作必须加 `@Transactional(rollbackFor = Exception.class)`
- 只读查询可按需使用 `@Transactional(readOnly = true)`
- 事务粒度尽量小，只包必要数据库操作
- 避免把远程调用、复杂计算、耗时任务放进大事务
- 独立日志、通知等可按需使用 `Propagation.REQUIRES_NEW`

## 异常处理

- 数据不存在时抛出 `BusinessException("xxx不存在")`
- 业务规则不满足时抛出 `BusinessException("明确业务原因")`
- 捕获异常后必须记录日志并重新抛出业务异常或运行时异常
- 禁止空 `catch`

## 日志

- `debug`：调试信息
- `info`：关键业务流程
- `warn`：可恢复异常或警告
- `error`：系统错误，必须包含完整堆栈

日志使用占位符，不使用字符串拼接：

```java
log.info("处理数据, ID: {}, 状态: {}", id, status);
log.error("保存失败: {}", e.getMessage(), e);
```

## 批量与性能

- 批量新增使用 `saveBatch`
- 批量修改使用 `updateBatchById`
- 批量删除使用 `removeBatchByIds`
- 避免循环内单条查询或单条写入
