# Controller 规范

适用于 `**/controller/**/*.java`。

## 基本要求

- 类上添加 `@Slf4j`、`@Api(tags = "...")`、`@RestController`、`@RequestMapping`
- 方法添加 `@ApiOperation("...")`
- 依赖注入使用 `@Resource`，不要使用 `@Autowired`
- Controller 只做参数接收、校验触发和服务调用，业务逻辑放到 Service
- 请求体使用 `@Validated @RequestBody XxxDto dto`
- 敏感操作添加 `@PreAuthorize`
- 分页接口返回 `ResponseDto<IPage<XxxBo>>`

## REST 规范

- `GET`：查询
- `POST`：新增
- `PUT`：修改
- `DELETE`：删除

URL 规则：

- 使用小写字母
- 单词间用 `-` 分隔
- 资源使用名词
- 避免多层嵌套，最多 2-3 层

## 常见接口形态

```java
@GetMapping("/page")
public ResponseDto<IPage<XxxBo>> page(XxxQuery query) {
    return ResponseDto.success(xxxService.page(query));
}

@GetMapping("/{id}")
public ResponseDto<XxxBo> getById(@PathVariable Long id) {
    return ResponseDto.success(xxxService.getById(id));
}

@PostMapping
public ResponseDto<Long> save(@Validated @RequestBody XxxDto dto) {
    return ResponseDto.success(xxxService.save(dto));
}

@PutMapping
public ResponseDto<Boolean> update(@Validated @RequestBody XxxDto dto) {
    return ResponseDto.success(xxxService.update(dto));
}

@DeleteMapping("/{id}")
public ResponseDto<Boolean> delete(@PathVariable Long id) {
    return ResponseDto.success(xxxService.delete(id));
}
```

## 参数校验

- ID、必填字段使用 `@NotNull`
- 字符串必填使用 `@NotBlank`
- 长度使用 `@Size`
- 数值范围使用 `@Min`、`@Max`
- 格式使用 `@Pattern`、`@Email`
- 新增/修改差异较大时使用分组校验
