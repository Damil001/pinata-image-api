"use client";
import { useParams } from "next/navigation";

export default function CategoryPage() {
  const params = useParams();
  const { category } = params;

  // You can use the category param to fetch data or render content
  return (
    <div>
      <h1>{category}</h1>
      <p>This is the page for {category}.</p>
    </div>
  );
}
