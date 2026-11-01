export default function Rating({ value = 0 }) {
  const full = Math.round(value)
  const stars = '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full)
  return (
    <div className="rating">
      <span className="stars">{stars}</span>
      <span>{Number(value).toFixed(1)}/5</span>
    </div>
  )
}
