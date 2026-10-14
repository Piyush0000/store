"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Star } from "lucide-react";
import { submitReview, uploadReviewMedia, type ProductReview, type ProductReviewMedia } from "@/lib/api";
import { isVideoUrl, videoMimeType } from "@/lib/media-type";
import { resolveMediaUrl } from "@/lib/media";

type Props = {
  productId: string;
  subdomain?: string;
  initialReviews?: ProductReview[];
  renderStars: (rating: number) => ReactNode;
};

const PAGE_SIZE = 4;
const MAX_FILES = 5;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

function mediaItems(review: ProductReview): ProductReviewMedia[] {
  const raw = Array.isArray(review.media) ? review.media : [];
  return raw
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const url = resolveMediaUrl(item);
        return url ? { url, type: isVideoUrl(url) ? "video" : "image" } as ProductReviewMedia : null;
      }
      const url = resolveMediaUrl(item.url);
      if (!url) return null;
      return { url, type: item.type === "video" || isVideoUrl(url) ? "video" : "image" };
    })
    .filter((item): item is ProductReviewMedia => Boolean(item));
}

export default function ProductReviews({ productId, subdomain, initialReviews = [], renderStars }: Props) {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const previewsMemo = useMemo(() => previews, [previews]);

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const rejected = incoming.find((file) => {
      const video = file.type.startsWith("video/");
      return file.size > (video ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES);
    });
    if (rejected) {
      const video = rejected.type.startsWith("video/");
      setError(video ? "Videos can be up to 10 MB." : "Photos can be up to 2 MB.");
      return;
    }
    setError(null);
    const next = [...files, ...incoming].slice(0, MAX_FILES);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles(next);
    setPreviews(next.map((file) => URL.createObjectURL(file)));
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setDone(null);
    if (!name.trim() || !content.trim() || rating < 1) {
      setError("Please add your name, a rating, and a review.");
      return;
    }
    setBusy(true);
    try {
      const media: ProductReviewMedia[] = [];
      for (const file of files) {
        media.push(await uploadReviewMedia(file, subdomain));
      }
      const result = await submitReview({
        productId,
        userName: name.trim(),
        rating,
        content: content.trim(),
        media,
      }, subdomain);
      const created: ProductReview = {
        id: String(result.review?.id || Date.now()),
        userName: name.trim(),
        rating,
        title: "",
        content: content.trim(),
        media: (result.review?.media as ProductReviewMedia[]) || media,
        createdAt: String(result.review?.createdAt || new Date().toISOString()),
      };
      setReviews((prev) => [created, ...prev]);
      setVisibleCount((count) => Math.max(count, PAGE_SIZE));
      setName("");
      setContent("");
      setRating(5);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setFiles([]);
      setPreviews([]);
      setDone(result.message || "Review submitted.");
    } catch (err: any) {
      setError(err?.message || "Could not submit review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="product-page__reviews">
      <form className="product-page__review-form" onSubmit={onSubmit}>
        <h3 className="product-page__section-title">Write a review</h3>
        <div className="product-page__review-stars-pick" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={value <= rating ? "is-on" : ""}
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
            >
              <Star size={22} fill={value <= rating ? "#FFC107" : "none"} stroke="#FFC107" />
            </button>
          ))}
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name*" required />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your experience*" rows={4} required />
        <label className="product-page__review-upload">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => onPickFiles(e.target.files)}
          />
          Add photos (max 2 MB) or videos (max 10 MB), up to {MAX_FILES}
        </label>
        {previewsMemo.length > 0 && (
          <div className="product-page__review-previews">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="product-page__review-preview">
                {file.type.startsWith("video/") ? (
                  <video src={previewsMemo[index]} muted />
                ) : (
                  <img src={previewsMemo[index]} alt="" />
                )}
                <button type="button" onClick={() => removeFile(index)} aria-label="Remove file">×</button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="product-page__review-error">{error}</p>}
        {done && <p className="product-page__review-ok">{done}</p>}
        <button type="submit" className="product-page__review-submit" disabled={busy}>
          {busy ? "Submitting..." : "Submit review"}
        </button>
      </form>

      {reviews.length === 0 ? (
        <div className="product-page__review-card product-page__review-card--empty">
          <p className="product-page__no-reviews">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="product-page__review-list">
          {reviews.slice(0, visibleCount).map((review) => {
            const media = mediaItems(review);
            const initial = (review.userName || "C").trim().charAt(0).toUpperCase();
            return (
              <article key={review.id} className="product-page__review-card">
                <div className="product-page__review-header">
                  <span className="product-page__review-avatar" aria-hidden="true">{initial}</span>
                  <div>
                    <span className="product-page__review-name">{review.userName}</span>
                    <div className="product-page__review-rating">
                      {renderStars(review.rating)}
                      <span>{new Date(review.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                </div>
                <p className="product-page__review-text">{review.content}</p>
                {media.length > 0 && (
                  <div className="product-page__review-media">
                    {media.map((item, index) =>
                      item.type === "video" ? (
                        <video key={`${review.id}-${index}`} controls src={item.url} preload="metadata">
                          <source src={item.url} type={videoMimeType(item.url)} />
                        </video>
                      ) : (
                        <img key={`${review.id}-${index}`} src={item.url} alt="" />
                      )
                    )}
                  </div>
                )}
              </article>
            );
          })}
          {reviews.length > PAGE_SIZE && (
            <button
              type="button"
              className="product-page__review-more"
              onClick={() =>
                setVisibleCount((count) =>
                  count >= reviews.length ? PAGE_SIZE : Math.min(reviews.length, count + PAGE_SIZE),
                )
              }
            >
              {visibleCount >= reviews.length
                ? "Show less"
                : `Show more (${reviews.length - visibleCount} more)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
