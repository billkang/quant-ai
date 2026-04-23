"""Seed HK and important stocks into the database."""

from sqlalchemy.orm import Session

from src.models.database import SessionLocal
from src.models.models import Stock

HK_STOCKS = [
    {"code": "3690.HK", "name": "美团-W", "market": "HK"},
    {"code": "9988.HK", "name": "阿里巴巴-W", "market": "HK"},
    {"code": "2015.HK", "name": "理想汽车-W", "market": "HK"},
    {"code": "9618.HK", "name": "京东集团-SW", "market": "HK"},
    {"code": "9868.HK", "name": "小鹏汽车-W", "market": "HK"},
    {"code": "9866.HK", "name": "蔚来-SW", "market": "HK"},
    {"code": "1810.HK", "name": "小米集团-W", "market": "HK"},
    {"code": "1211.HK", "name": "比亚迪股份", "market": "HK"},
    {"code": "0700.HK", "name": "腾讯控股", "market": "HK"},
    {"code": "2318.HK", "name": "中国平安", "market": "HK"},
    {"code": "1299.HK", "name": "友邦保险", "market": "HK"},
    {"code": "0883.HK", "name": "中国海洋石油", "market": "HK"},
]

A_SHARE_STOCKS = [
    {"code": "600519", "name": "贵州茅台", "market": "SH"},
    {"code": "000858", "name": "五粮液", "market": "SZ"},
    {"code": "300750", "name": "宁德时代", "market": "SZ"},
    {"code": "002594", "name": "比亚迪", "market": "SZ"},
    {"code": "000333", "name": "美的集团", "market": "SZ"},
    {"code": "600036", "name": "招商银行", "market": "SH"},
    {"code": "000002", "name": "万科A", "market": "SZ"},
    {"code": "002415", "name": "海康威视", "market": "SZ"},
]

US_STOCKS = [
    {"code": "BABA", "name": "Alibaba", "market": "US"},
    {"code": "TSLA", "name": "Tesla", "market": "US"},
    {"code": "AAPL", "name": "Apple", "market": "US"},
    {"code": "MSFT", "name": "Microsoft", "market": "US"},
    {"code": "NVDA", "name": "NVIDIA", "market": "US"},
]

ALL_STOCKS = HK_STOCKS + A_SHARE_STOCKS + US_STOCKS


def seed_stocks(db: Session) -> None:
    for s in ALL_STOCKS:
        existing = db.query(Stock).filter(Stock.code == s["code"]).first()
        if existing:
            continue
        stock = Stock(
            code=s["code"],
            name=s["name"],
            market=s["market"],
        )
        db.add(stock)
        db.commit()
        print(f"Seeded stock: {s['code']} {s['name']}")


def main():
    db = SessionLocal()
    try:
        seed_stocks(db)
        print("Stocks seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
