export default function Cat({ mood = 'idle', variant = 'walking' }) {
  const WALKING_CAT_URL = 'https://as1.ftcdn.net/v2/jpg/09/76/07/00/1000_F_976070025_JwuFq8Wokauj5usVS7IjJYScq5ghMLwJ.jpg';
  const PORTRAIT_CAT_URL = 'https://t4.ftcdn.net/jpg/09/57/93/49/240_F_957934941_nrYerHSonRbWMhoZHcZQ5LwQcwjQ1yoo.jpg';

  const imageUrl = variant === 'portrait' ? PORTRAIT_CAT_URL : WALKING_CAT_URL;

  return (
    <img 
      src={imageUrl} 
      className={`cat-media cat-${mood}`} 
      alt="cat" 
    />
  );
}
