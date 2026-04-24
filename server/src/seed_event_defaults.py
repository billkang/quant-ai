"""Seed default event sources, rules, jobs and events for mvp-event-factor-core."""

from datetime import datetime, timedelta
from typing import Any

from sqlalchemy.orm import Session

from src.models.database import SessionLocal
from src.models.models import Event, EventJob, EventRule, EventSource

DEFAULT_EVENT_SOURCES = [
    {
        "name": "东方财富个股新闻",
        "source_type": "stock_news",
        "scope": "individual",
        "config": {
            "source": "eastmoney",
            "api": "stock_news_em",
            "stock_pool": "watchlist+backtest",
            "max_pages": 3,
        },
        "schedule": "0 */6 * * *",
        "enabled": 1,
    },
    {
        "name": "东方财富个股公告",
        "source_type": "stock_notice",
        "scope": "individual",
        "config": {
            "source": "eastmoney",
            "api": "stock_zh_a_alerts",
            "stock_pool": "watchlist+backtest",
            "max_pages": 2,
        },
        "schedule": "0 */12 * * *",
        "enabled": 1,
    },
    {
        "name": "A股宏观数据",
        "source_type": "macro_data",
        "scope": "market",
        "config": {
            "source": "akshare",
            "indicators": ["cpi", "ppi", "pmi", "m2", "gdp"],
        },
        "schedule": "0 9 * * *",
        "enabled": 1,
    },
    {
        "name": "港股新闻数据源",
        "source_type": "stock_news",
        "scope": "individual",
        "config": {
            "source": "yahoo",
            "api": "yahoo_finance_news",
            "stock_pool": "hk",
            "markets": ["HK"],
            "max_pages": 2,
        },
        "schedule": "0 */8 * * *",
        "enabled": 1,
    },
    {
        "name": "个股行情数据采集",
        "source_type": "stock_price",
        "scope": "individual",
        "config": {
            "source": "akshare",
            "api": "stock_zh_a_spot",
            "fields": ["open", "high", "low", "close", "volume", "amount"],
            "stock_pool": "all_a_share",
        },
        "schedule": "0 16 * * 1-5",
        "enabled": 1,
    },
    {
        "name": "个股财务数据采集",
        "source_type": "stock_fundamental",
        "scope": "individual",
        "config": {
            "source": "akshare",
            "api": "stock_financial_report_sina",
            "fields": ["pe", "pb", "roe", "revenue", "profit", "debt_ratio"],
            "stock_pool": "watchlist+backtest",
        },
        "schedule": "0 3 1 * *",
        "enabled": 1,
    },
    {
        "name": "板块轮动数据",
        "source_type": "sector_data",
        "scope": "sector",
        "config": {
            "source": "eastmoney",
            "api": "sector_flow",
            "fields": ["sector_name", "change_percent", "inflow", "main_force"],
        },
        "schedule": "0 17 * * 1-5",
        "enabled": 1,
    },
    {
        "name": "国际市场数据",
        "source_type": "international",
        "scope": "market",
        "config": {
            "source": "yahoo",
            "api": "world_indices",
            "indices": ["^GSPC", "^IXIC", "^DJI", "^N225", "^FTSE", "^HSI"],
        },
        "schedule": "0 7 * * 1-5",
        "enabled": 1,
    },
]

DEFAULT_EVENT_RULES = [
    {
        "name": "情感词典 v1.0",
        "rule_type": "sentiment_extractor",
        "version": "1.0",
        "config": {
            "positive_keywords": [
                "增长",
                "上涨",
                "盈利",
                "超预期",
                "利好",
                "增持",
                "回购",
                "分红",
                "净利润增长",
                "营收增长",
                "业绩亮眼",
                "创新高",
                "突破",
                "强势",
                "推荐",
                "买入",
                "看好",
                "超预期",
                "大幅增长",
                "扭亏为盈",
                "市场份额扩大",
                "订单饱满",
                "业绩预增",
                "高送转",
                "并购",
                "战略合作",
                "技术突破",
                "新品发布",
            ],
            "negative_keywords": [
                "下跌",
                "亏损",
                "下滑",
                "不及预期",
                "利空",
                "减持",
                "质押",
                "违约",
                "营收下降",
                "净利润下滑",
                "业绩暴雷",
                "创新低",
                "跌破",
                "弱势",
                "卖出",
                "看空",
                "不及预期",
                "大幅下滑",
                "由盈转亏",
                "市场份额萎缩",
                "订单减少",
                "业绩预减",
                "停产",
                "召回",
                "监管处罚",
                "诉讼",
                "裁员",
            ],
            "multipliers": {
                "大幅增长": 1.5,
                "超预期": 1.3,
                "扭亏为盈": 1.4,
                "业绩暴雷": -1.5,
                "大幅下滑": -1.4,
                "由盈转亏": -1.5,
            },
            "scoring": {
                "base_score_per_keyword": 0.15,
                "max_sentiment": 1.0,
                "min_sentiment": -1.0,
            },
        },
        "is_active": 1,
    },
    {
        "name": "事件分类器 v1.0",
        "rule_type": "classifier",
        "version": "1.0",
        "config": {
            "categories": {
                "earnings": {
                    "keywords": [
                        "业绩",
                        "净利润",
                        "营收",
                        "盈利",
                        "亏损",
                        "季报",
                        "年报",
                        "业绩预告",
                    ],
                    "strength": 0.8,
                    "duration": "short",
                },
                "policy": {
                    "keywords": ["政策", "监管", "法规", "扶持", "限制", "补贴", "税收"],
                    "strength": 0.7,
                    "duration": "medium",
                },
                "merger": {
                    "keywords": ["并购", "重组", "收购", "合并", "借壳", "资产注入"],
                    "strength": 0.9,
                    "duration": "long",
                },
                "product": {
                    "keywords": ["新品", "发布", "量产", "订单", "合同", "中标"],
                    "strength": 0.6,
                    "duration": "short",
                },
                "macro": {
                    "keywords": ["CPI", "PPI", "PMI", "M2", "GDP", "利率", "降准", "降息"],
                    "strength": 0.5,
                    "duration": "medium",
                },
                "shareholder": {
                    "keywords": ["增持", "减持", "回购", "质押", "解禁", "股权激励"],
                    "strength": 0.6,
                    "duration": "short",
                },
            },
            "default": {
                "category": "general",
                "strength": 0.3,
                "duration": "short",
            },
        },
        "is_active": 1,
    },
    {
        "name": "板块映射 v1.0",
        "rule_type": "sector_mapper",
        "version": "1.0",
        "config": {
            "source": "csrc",
            "fallback_sector": "综合",
            "keyword_to_sector": {
                "白酒": "酒、饮料和精制茶制造业",
                "新能源": "电气机械和器材制造业",
                "芯片": "计算机、通信和其他电子设备制造业",
                "医药": "医药制造业",
                "银行": "货币金融服务",
                "地产": "房地产业",
                "钢铁": "黑色金属冶炼和压延加工业",
                "煤炭": "煤炭开采和洗选业",
                "光伏": "电气机械和器材制造业",
                "锂电池": "电气机械和器材制造业",
                "人工智能": "软件和信息技术服务业",
                "云计算": "软件和信息技术服务业",
                "半导体": "计算机、通信和其他电子设备制造业",
            },
        },
        "is_active": 1,
    },
]

DEMO_EVENTS: list[dict[str, Any]] = [
    {
        "scope": "individual",
        "symbol": "600519",
        "sector": "酒、饮料和精制茶制造业",
        "title": "贵州茅台一季度净利润同比增长15.7%",
        "summary": "贵州茅台发布2025年一季度报告，实现营业收入XXX亿元，同比增长15.7%。",
        "sentiment": 0.82,
        "strength": 0.75,
        "certainty": 0.95,
        "urgency": 0.3,
        "duration": "short",
        "tags": ["业绩", "白酒", "季报"],
        "signals": {"category": "earnings", "keywords": ["净利润", "增长"]},
    },
    {
        "scope": "individual",
        "symbol": "300750",
        "sector": "电气机械和器材制造业",
        "title": "宁德时代与特斯拉签订长期供货协议",
        "summary": "宁德时代宣布与特斯拉签署为期三年的动力电池供货协议。",
        "sentiment": 0.68,
        "strength": 0.85,
        "certainty": 0.88,
        "urgency": 0.5,
        "duration": "long",
        "tags": ["合作", "新能源", "订单"],
        "signals": {"category": "product", "keywords": ["供货协议", "合同"]},
    },
    {
        "scope": "market",
        "symbol": None,
        "sector": None,
        "title": "央行宣布降准0.5个百分点释放流动性",
        "summary": "中国人民银行决定于2025年4月25日下调金融机构存款准备金率0.5个百分点。",
        "sentiment": 0.55,
        "strength": 0.70,
        "certainty": 1.0,
        "urgency": 0.8,
        "duration": "medium",
        "tags": ["宏观", "货币政策", "降准"],
        "signals": {"category": "macro", "keywords": ["降准", "流动性"]},
    },
    {
        "scope": "sector",
        "symbol": None,
        "sector": "医药制造业",
        "title": "医药行业集采政策温和落地，创新药迎来利好",
        "summary": "第七批国家药品集采结果公布，整体降价幅度低于预期，创新药板块受益明显。",
        "sentiment": 0.45,
        "strength": 0.60,
        "certainty": 0.80,
        "urgency": 0.6,
        "duration": "medium",
        "tags": ["政策", "医药", "集采"],
        "signals": {"category": "policy", "keywords": ["集采", "创新药"]},
    },
    {
        "scope": "individual",
        "symbol": "002594",
        "sector": "电气机械和器材制造业",
        "title": "比亚迪4月新能源车销量再创新高",
        "summary": "比亚迪发布4月销量数据，新能源汽车销量突破30万辆，同比增长35%。",
        "sentiment": 0.72,
        "strength": 0.65,
        "certainty": 0.92,
        "urgency": 0.4,
        "duration": "short",
        "tags": ["销量", "新能源", "业绩"],
        "signals": {"category": "earnings", "keywords": ["销量", "增长"]},
    },
    {
        "scope": "individual",
        "symbol": "3690.HK",
        "sector": "软件和信息技术服务业",
        "title": "美团外卖业务季度营收超预期",
        "summary": "美团发布Q1财报，外卖及到店业务营收同比增长22%，超出市场预期。",
        "sentiment": 0.60,
        "strength": 0.55,
        "certainty": 0.90,
        "urgency": 0.3,
        "duration": "short",
        "tags": ["业绩", "港股", "外卖"],
        "signals": {"category": "earnings", "keywords": ["营收", "超预期"]},
    },
]


def seed_event_sources(db: Session) -> None:
    for s in DEFAULT_EVENT_SOURCES:
        existing = db.query(EventSource).filter(EventSource.name == s["name"]).first()
        if existing:
            if existing.is_builtin != 1:
                existing.is_builtin = 1
                db.commit()
            continue
        source = EventSource(**s, is_builtin=1)
        db.add(source)
        db.commit()


def seed_event_rules(db: Session) -> None:
    for r in DEFAULT_EVENT_RULES:
        existing = (
            db.query(EventRule)
            .filter(EventRule.rule_type == r["rule_type"], EventRule.is_active == 1)
            .first()
        )
        if existing:
            continue
        rule = EventRule(**r)
        db.add(rule)
        db.commit()


def seed_event_jobs(db: Session) -> None:
    """Seed demo event jobs so the jobs page shows data."""

    # Only seed if table is empty
    count = db.query(EventJob).count()
    if count > 0:
        return

    sources = db.query(EventSource).all()
    if not sources:
        return

    now = datetime.utcnow()
    demo_jobs = [
        {
            "source_id": sources[0].id if sources else 1,
            "status": "success",
            "new_events_count": 12,
            "duplicate_count": 3,
            "error_count": 0,
            "logs": "Fetching stock news from eastmoney...\nPage 1: 8 articles\nPage 2: 7 articles\nFiltered duplicates: 3\nSaved new events: 12\nDone.",
            "started_at": now - timedelta(hours=2),
            "completed_at": now - timedelta(hours=1, minutes=55),
        },
        {
            "source_id": sources[1].id if len(sources) > 1 else 1,
            "status": "success",
            "new_events_count": 5,
            "duplicate_count": 1,
            "error_count": 0,
            "logs": "Fetching stock notices...\nPage 1: 6 notices\nFiltered duplicates: 1\nSaved new events: 5\nDone.",
            "started_at": now - timedelta(hours=6),
            "completed_at": now - timedelta(hours=5, minutes=58),
        },
        {
            "source_id": sources[2].id if len(sources) > 2 else 1,
            "status": "failed",
            "new_events_count": 0,
            "duplicate_count": 0,
            "error_count": 1,
            "logs": "Fetching macro data from akshare...\nError: Connection timeout to akshare API\nRetry 1/3...\nFailed after 3 retries.",
            "error_message": "Connection timeout to akshare API",
            "started_at": now - timedelta(hours=12),
            "completed_at": now - timedelta(hours=11, minutes=50),
        },
        {
            "source_id": sources[0].id if sources else 1,
            "status": "running",
            "new_events_count": 0,
            "duplicate_count": 0,
            "error_count": 0,
            "logs": "Fetching stock news from eastmoney...\nPage 1: fetching...",
            "started_at": now - timedelta(minutes=5),
            "completed_at": None,
        },
    ]

    for job_data in demo_jobs:
        job = EventJob(**job_data)  # type: ignore[arg-type]
        db.add(job)
        db.commit()


def seed_demo_events(db: Session) -> None:
    """Seed demo events so the events page shows data."""
    count = db.query(Event).count()
    if count > 0:
        return

    sources = db.query(EventSource).all()
    default_source_id = sources[0].id if sources else None

    now = datetime.utcnow()
    for i, e in enumerate(DEMO_EVENTS):
        event = Event(
            source_id=default_source_id,
            scope=e["scope"],
            symbol=e["symbol"],
            sector=e["sector"],
            title=e["title"],
            summary=e["summary"],
            sentiment=e["sentiment"],
            strength=e["strength"],
            certainty=e["certainty"],
            urgency=e["urgency"],
            duration=e["duration"],
            tags=e["tags"],
            signals=e["signals"],
            created_at=now - timedelta(hours=i * 3),
        )
        db.add(event)
        db.commit()


def seed_data_channels(db: Session) -> None:
    from src.models.models import DataChannel

    defaults = [
        {"name": "AkShare", "provider": "akshare", "timeout": 30, "is_active": 1},
        {"name": "东方财富", "provider": "eastmoney", "timeout": 30, "is_active": 1},
        {"name": "Yahoo Finance", "provider": "yahoo", "timeout": 30, "is_active": 1},
    ]
    for d in defaults:
        existing = db.query(DataChannel).filter(DataChannel.provider == d["provider"]).first()
        if existing:
            continue
        channel = DataChannel(**d)
        db.add(channel)
        db.commit()


def seed_sectors(db: Session) -> None:
    from src.models.models import Sector

    c_sectors = [
        ("A01", "农业"),
        ("A02", "林业"),
        ("A03", "畜牧业"),
        ("A04", "渔业"),
        ("B06", "煤炭开采和洗选业"),
        ("B07", "石油和天然气开采业"),
        ("B08", "黑色金属矿采选业"),
        ("B09", "有色金属矿采选业"),
        ("B10", "非金属矿采选业"),
        ("B11", "开采辅助活动"),
        ("B12", "其他采矿业"),
        ("C13", "农副食品加工业"),
        ("C14", "食品制造业"),
        ("C15", "酒、饮料和精制茶制造业"),
        ("C16", "烟草制品业"),
        ("C17", "纺织业"),
        ("C18", "纺织服装、服饰业"),
        ("C19", "皮革、毛皮、羽毛及其制品和制鞋业"),
        ("C20", "木材加工和木、竹、藤、棕、草制品业"),
        ("C21", "家具制造业"),
        ("C22", "造纸和纸制品业"),
        ("C23", "印刷和记录媒介复制业"),
        ("C24", "文教、工美、体育和娱乐用品制造业"),
        ("C25", "石油加工、炼焦和核燃料加工业"),
        ("C26", "化学原料和化学制品制造业"),
        ("C27", "医药制造业"),
        ("C28", "化学纤维制造业"),
        ("C29", "橡胶和塑料制品业"),
        ("C30", "非金属矿物制品业"),
        ("C31", "黑色金属冶炼和压延加工业"),
        ("C32", "有色金属冶炼和压延加工业"),
        ("C33", "金属制品业"),
        ("C34", "通用设备制造业"),
        ("C35", "专用设备制造业"),
        ("C36", "汽车制造业"),
        ("C37", "铁路、船舶、航空航天和其他运输设备制造业"),
        ("C38", "电气机械和器材制造业"),
        ("C39", "计算机、通信和其他电子设备制造业"),
        ("C40", "仪器仪表制造业"),
        ("C41", "其他制造业"),
        ("C42", "废弃资源综合利用业"),
        ("D44", "电力、热力生产和供应业"),
        ("D45", "燃气生产和供应业"),
        ("D46", "水的生产和供应业"),
        ("E47", "房屋建筑业"),
        ("E48", "土木工程建筑业"),
        ("E49", "建筑安装业"),
        ("E50", "建筑装饰和其他建筑业"),
        ("F51", "批发业"),
        ("F52", "零售业"),
        ("G53", "铁路运输业"),
        ("G54", "道路运输业"),
        ("G55", "水上运输业"),
        ("G56", "航空运输业"),
        ("G57", "管道运输业"),
        ("G58", "装卸搬运和运输代理业"),
        ("G59", "仓储业"),
        ("G60", "邮政业"),
        ("H61", "住宿业"),
        ("H62", "餐饮业"),
        ("I63", "电信、广播电视和卫星传输服务"),
        ("I64", "互联网和相关服务"),
        ("I65", "软件和信息技术服务业"),
        ("J66", "货币金融服务"),
        ("J67", "资本市场服务"),
        ("J68", "保险业"),
        ("J69", "其他金融业"),
        ("K70", "房地产业"),
        ("L71", "租赁业"),
        ("L72", "商务服务业"),
        ("M73", "研究和试验发展"),
        ("M74", "专业技术服务业"),
        ("M75", "科技推广和应用服务业"),
        ("N76", "水利管理业"),
        ("N77", "生态保护和环境治理业"),
        ("N78", "公共设施管理业"),
        ("O79", "居民服务业"),
        ("O80", "机动车、电子产品和日用产品修理业"),
        ("O81", "其他服务业"),
        ("P82", "教育"),
        ("Q83", "卫生"),
        ("Q84", "社会工作"),
        ("R85", "新闻和出版业"),
        ("R86", "广播、电视、电影和影视录音制作业"),
        ("R87", "文化艺术业"),
        ("R88", "体育"),
        ("R89", "娱乐业"),
    ]
    for code, name in c_sectors:
        existing = db.query(Sector).filter(Sector.code == code).first()
        if existing:
            continue
        sector = Sector(code=code, name=name, level=1, is_enabled=1, source="csrc")
        db.add(sector)
        db.commit()


def main():
    db = SessionLocal()
    try:
        seed_event_sources(db)
        seed_event_rules(db)
        seed_event_jobs(db)
        seed_demo_events(db)
        seed_data_channels(db)
        seed_sectors(db)
        print("Default event data seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
