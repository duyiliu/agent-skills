# Mapper 与 MyBatis XML 规范

适用于 `**/mapper/**/*.java`、`**/mapper/**/*.xml`。

## Mapper 接口

- Mapper 接口继承 `BaseMapper<Xxx>`
- 多参数或 XML 引用参数必须使用 `@Param`
- 分页查询返回 `IPage<XxxBo>`

```java
public interface XxxMapper extends BaseMapper<Xxx> {
    IPage<XxxBo> selectPageBo(@Param("page") Page<Xxx> page, @Param("query") XxxQuery query);

    List<XxxBo> selectListBo(@Param("query") XxxQuery query);

    XxxBo selectBoById(@Param("id") Long id);
}
```

## XML 规则

- 禁止 `select *`，明确列名
- 公共字段使用 `<sql>` 片段
- 动态条件使用 `<where>`、`<if>`
- 批量条件使用 `<foreach>`
- 查询使用 `#{}`，禁止 `${}`
- 必须使用 `${}` 处理动态表名/字段时，先做白名单校验

```xml
<sql id="selectColumns">
    id,
    name,
    status,
    create_time,
    update_time
</sql>

<select id="selectBoById" resultMap="XxxBoResult">
    select <include refid="selectColumns"/>
    from xxx
    where id = #{id}
</select>
```

## 性能规范

- 列表查询原则上必须支持分页，避免一次性查全量
- 避免 N+1 查询，使用 JOIN 或批量查询
- 查询条件字段应建立索引
- 避免在索引字段上使用函数导致索引失效
- 只查询需要的字段，避免返回大字段
- 批量插入、修改、删除不要使用循环单条操作

## XML 路径

通常放在：

```text
src/main/resources/mapper/
```
