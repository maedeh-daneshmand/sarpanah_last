from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.wishlist import Wishlist, WishlistItem
from app.models.property import Property
from app.schemas.wishlist import (
    WishlistCreate,
    WishlistUpdate,
    WishlistResponse,
    WishlistItemCreate,
    WishlistItemResponse,
)
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    ConflictException,
)

router = APIRouter(prefix="/wishlists", tags=["Wishlists"])


@router.get("/", response_model=List[WishlistResponse])
def get_user_wishlists(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()


@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def create_wishlist(
    wishlist_in: WishlistCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id, Wishlist.name == wishlist_in.name)
        .first()
    )
    if existing:
        raise ConflictException(f"A wishlist named '{wishlist_in.name}' already exists.")

    wishlist = Wishlist(user_id=current_user.id, name=wishlist_in.name)
    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)
    return wishlist


@router.put("/{wishlist_id}", response_model=WishlistResponse)
def rename_wishlist(
    wishlist_id: int,
    wishlist_in: WishlistUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    wishlist = db.query(Wishlist).filter(Wishlist.id == wishlist_id).first()
    if not wishlist:
        raise NotFoundException("Wishlist", wishlist_id)

    if wishlist.user_id != current_user.id:
        raise ForbiddenException("You can only modify your own wishlists.")

    wishlist.name = wishlist_in.name
    db.commit()
    db.refresh(wishlist)
    return wishlist


@router.delete("/{wishlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wishlist(
    wishlist_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    wishlist = db.query(Wishlist).filter(Wishlist.id == wishlist_id).first()
    if not wishlist:
        raise NotFoundException("Wishlist", wishlist_id)

    if wishlist.user_id != current_user.id:
        raise ForbiddenException("You can only delete your own wishlists.")

    db.delete(wishlist)
    db.commit()
    return None


@router.post("/{wishlist_id}/items", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_item_to_wishlist(
    wishlist_id: int,
    item_in: WishlistItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    wishlist = db.query(Wishlist).filter(Wishlist.id == wishlist_id).first()
    if not wishlist:
        raise NotFoundException("Wishlist", wishlist_id)

    if wishlist.user_id != current_user.id:
        raise ForbiddenException("You can only add items to your own wishlists.")

    prop = db.query(Property).filter(Property.id == item_in.property_id).first()
    if not prop:
        raise NotFoundException("Property", item_in.property_id)

    existing_item = (
        db.query(WishlistItem)
        .filter(WishlistItem.wishlist_id == wishlist_id, WishlistItem.property_id == item_in.property_id)
        .first()
    )
    if existing_item:
        raise ConflictException("Property is already in this wishlist.")

    item = WishlistItem(wishlist_id=wishlist_id, property_id=item_in.property_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{wishlist_id}/items/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item_from_wishlist(
    wishlist_id: int,
    property_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    wishlist = db.query(Wishlist).filter(Wishlist.id == wishlist_id).first()
    if not wishlist:
        raise NotFoundException("Wishlist", wishlist_id)

    if wishlist.user_id != current_user.id:
        raise ForbiddenException("You can only remove items from your own wishlists.")

    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.wishlist_id == wishlist_id, WishlistItem.property_id == property_id)
        .first()
    )
    if not item:
        raise NotFoundException("WishlistItem", f"property {property_id} in wishlist {wishlist_id}")

    db.delete(item)
    db.commit()
    return None
