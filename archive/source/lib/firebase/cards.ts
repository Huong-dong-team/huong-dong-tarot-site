"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseServices } from "./client";

export type PublishedCard = DocumentData & {
  slug: string;
  status: "published";
  displayOrder: number;
  title: string;
  vietnameseTitle: string;
};

/** Đọc một lá đã xuất bản. Firestore Rules vẫn là lớp bảo vệ quyết định. */
export async function getPublishedCard(slug: string): Promise<PublishedCard | null> {
  const { firestore } = getFirebaseServices();
  const snapshot = await getDoc(doc(firestore, "cards", slug));
  if (!snapshot.exists() || snapshot.data().status !== "published") return null;
  return snapshot.data() as PublishedCard;
}

/** Giới hạn tối đa 78 lá để tránh truy vấn không kiểm soát. */
export async function listPublishedCards(maxItems = 22): Promise<PublishedCard[]> {
  const { firestore } = getFirebaseServices();
  const safeLimit = Math.min(Math.max(Math.trunc(maxItems), 1), 78);
  const cardsQuery = query(
    collection(firestore, "cards"),
    where("status", "==", "published"),
    orderBy("displayOrder", "asc"),
    limit(safeLimit),
  );
  const snapshot = await getDocs(cardsQuery);
  return snapshot.docs.map((item) => item.data() as PublishedCard);
}
