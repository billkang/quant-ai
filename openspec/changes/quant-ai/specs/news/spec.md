# News 资讯聚合

## 功能概述

提供股票新闻、公告、宏观资讯聚合。

## API 接口

### 获取资讯列表
```
GET /api/news?category={all|stock|macro}&symbol={code}
```

### 获取数据源列表
```
GET /api/news/sources
```

### 添加数据源
```
POST /api/news/sources
Body: { name, source_type, config, interval_minutes }
```

### 更新数据源
```
PUT /api/news/sources/{id}
Body: { name?, source_type?, config?, interval_minutes?, enabled? }
```

### 删除数据源
```
DELETE /api/news/sources/{id}
```

### 手动拉取
```
POST /api/news/sources/{id}/fetch
```

## 场景

### 获取股票新闻
- **WHEN** 用户请求某只股票的最新新闻
- **THEN** 系统返回该股票相关的新闻列表

### 管理数据源
- **WHEN** 用户添加/编辑/删除数据源
- **THEN** 系统保存配置并可在定时任务中自动拉取

## 状态

✅ 已完成（前端预设沪深A股、港股数据源）