from fastapi import HTTPException
from models.reviews import Review
from typing import List
from pymongo.errors import PyMongoError
from config.db import db

reviews_collection = db["reviews"]

async def get_review_by_id(review_id: str) -> Review:
    review = await reviews_collection.find_one({"_id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return Review(**review)

async def get_reviews_by_cart_id(cart_id: str) -> List[Review]:
    reviews = reviews_collection.find({"cart_id": cart_id})
    return [Review(**r) async for r in reviews]

async def get_all_reviews() -> List[Review]:
    reviews = reviews_collection.find()
    return [Review(**r) async for r in reviews]

async def create_review(review: Review) -> Review:
    try:
        await reviews_collection.insert_one(review.dict())
        return review
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))

async def update_review(review_id: str, review_data: dict) -> Review:
    result = await reviews_collection.update_one({"_id": review_id}, {"$set": review_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    review = await reviews_collection.find_one({"_id": review_id})
    return Review(**review)

async def delete_review(review_id: str):
    result = await reviews_collection.delete_one({"_id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
