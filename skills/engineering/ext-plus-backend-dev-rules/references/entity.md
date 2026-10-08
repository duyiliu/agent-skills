# Entity 规范

适用于 `**/model/entity/**/*.java`。

## 基本要求

- 实体继承项目统一基类，例如 `BaseEntity`
- 业务子模块按项目约定使用业务基类
- 所有字段添加 `@ApiModelProperty`
- 日期使用 `LocalDate`
- 时间使用 `LocalDateTime`
- 金额或高精度小数字段使用 `BigDecimal`
- 禁用基本类型，使用包装类

## 继承字段（建表必须带上，禁止遗漏）

实体继承 `BaseEntity` 后，父类字段会自动映射为数据库列。**生成建表 SQL 时，除了实体自身声明的字段，必须额外补齐这些公共列**，否则运行时插入/更新会因为缺列报错。

`BaseEntity`（`ext.plus.common.core.domain.BaseEntity`）提供的公共字段：

| Java 字段     | 类型             | 数据库列        | 数据库类型                                              | 约束 / 默认值                                                    |
| ------------- | ---------------- | --------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `id`          | `Long`           | `id`            | `BIGINT` / `BIGINT UNSIGNED`                            | `NOT NULL`，主键                                                 |
| `delStatus`   | `Integer`        | `del_status`    | `TINYINT(1)` / `BIT(1)`                                 | `NOT NULL DEFAULT 1`（1-未删除 0-已删除，逻辑删除标记）          |
| `remark`      | `String`         | `remark`        | `VARCHAR(255)` / `VARCHAR(500)`                         | 可空，业务备注                                                   |
| `createBy`    | `Long`           | `create_by`     | `BIGINT` / `BIGINT UNSIGNED`                            | 创建人 ID                                                        |
| `createTime`  | `LocalDateTime`  | `create_time`   | `DATETIME` / `DATETIME(3)`                              | `NOT NULL DEFAULT CURRENT_TIMESTAMP[(3)]`                        |
| `updateBy`    | `Long`           | `update_by`     | `BIGINT` / `BIGINT UNSIGNED`                            | 更新人 ID                                                        |
| `updateTime`  | `LocalDateTime`  | `update_time`   | `DATETIME` / `DATETIME(3)`                              | `NOT NULL DEFAULT CURRENT_TIMESTAMP[(3)] ON UPDATE CURRENT_TIMESTAMP[(3)]` |

约定：

- 这些列**不要**在子实体里再声明一遍，避免与父类冲突。
- 建表 SQL 里统一放在业务字段之后、主键之前，便于审阅。
- `create_time` / `update_time` 必须带默认值，`update_time` 必须带 `ON UPDATE`，让数据库自身维护时间，避免依赖应用层每次写入。
- `del_status` 用作逻辑删除，查询默认带 `del_status = 1` 条件，不要物理删除。

标准建表尾部片段（可直接复用）：

```sql
-- BaseEntity 公共列
`del_status`  TINYINT(1)     NOT NULL DEFAULT 1 COMMENT '1-未删除 0-已删除',
`remark`      VARCHAR(255)   DEFAULT NULL       COMMENT '备注',
`create_by`   BIGINT UNSIGNED DEFAULT NULL      COMMENT '创建人',
`create_time` DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
`update_by`   BIGINT UNSIGNED DEFAULT NULL      COMMENT '更新人',
`update_time` DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
PRIMARY KEY (`id`)
```

### 业务基类的额外继承字段

如果实体不是直接继承 `BaseEntity`，而是继承项目自定义的业务基类，必须把业务基类新增的字段一并加入建表 SQL：

- `BaseBizV3Entity`（`com.yzkj.fgs.common.model.BaseBizV3Entity`）新增：
  - `medical_record_id` `BIGINT` `NOT NULL`，关联就诊记录 ID
- `BaseBizPersonEntity`（`com.yzkj.fgs.common.model.BaseBizPersonEntity`）新增：
  - `person_id` `BIGINT` `NOT NULL`，关联人员信息 ID

业务基类的字段应建索引（高频关联查询条件），例如 `KEY idx_medical_record_id (medical_record_id)`。

生成建表 SQL 前的校验清单：

- 是否包含 `id` 主键
- 是否包含 `del_status` 逻辑删除列
- 是否包含完整的 `create_by/create_time/update_by/update_time` 四个审计列
- `create_time` / `update_time` 是否带默认值与 `ON UPDATE`
- 是否按实际继承链路补全业务基类的额外列（如 `medical_record_id`、`person_id`）

## 常见类注解

```java
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ApiModel("实体中文名")
@TableName(autoResultMap = true)
public class Xxx extends BaseEntity {
}
```

## 字段规范

```java
@ApiModelProperty("字段说明")
private String fieldName;
```

字典字段：

```java
@ApiModelProperty("性别")
@DataDic("gender")
private String gender;
```

集合字段：

```java
@ApiModelProperty("标签列表")
@TableField(typeHandler = ListStringTypeHandler.class)
private List<String> tags;
```

显式更新为 `null`：

```java
@ApiModelProperty("备注")
@TableField(updateStrategy = FieldStrategy.ALWAYS)
private String remark;
```

非数据库字段：

```java
@ApiModelProperty("计算字段")
@TableField(exist = false)
private String computedField;
```

## 类型规范

- ID、外键：`Long`
- 状态、类型：`Integer`
- 开关：`Boolean`
- 文本、编码：`String`
- 日期：`LocalDate`
- 时间：`LocalDateTime`
- 金额：`BigDecimal`
- 集合：`List<String>`、`Set<Long>`、`Set<String>` 并配置 TypeHandler

## 地区字段

按层级顺序定义，Code/Name 成对出现：

```java
private String provinceCode;
private String provinceName;
private String cityCode;
private String cityName;
private String districtCode;
private String districtName;
private String streetCode;
private String streetName;
private String communityCode;
private String communityName;
private String houseNumber;
```

## 第三方字段

第三方 ID 统一使用 `xxxThirdId` 后缀，例如：

```java
private String companyThirdId;
private String userThirdId;
```
