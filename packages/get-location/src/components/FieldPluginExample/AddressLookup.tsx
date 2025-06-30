import { useState } from 'react'

type Coordinates = {
  lat: number
  lng: number
  formatted_address: string
  embedUrl: string
}

type AddressLookupProps = {
  onSelect: (data: Coordinates) => void
  saved?: Coordinates | null
}

const AddressLookup = ({ onSelect, saved }: AddressLookupProps) => {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [cooldown, setCooldown] = useState(false)

  const handleSearch = async () => {
    if (!query.trim() || cooldown) return

    setIsSearching(true)
    setCooldown(true)

    try {
      const res = await fetch(
        `https://getcoordinates-w6xsxm425a-uc.a.run.app?address=${encodeURIComponent(
          query
        )}`
      )

      const data = await res.json()
      console.log('Coordinates received:', data)

      if (!data.lat || !data.lng) throw new Error('Invalid response')

      onSelect(data) // ✅ Save result, but don't display it
    } catch (err) {
      console.error('Failed to fetch coordinates:', err)
    } finally {
      setIsSearching(false)
      setTimeout(() => setCooldown(false), 2000)
    }
  }

  return (
    <div className="address-lookup">
      <div className="input-group">
        <input
          className="address-input"
          type="text"
          placeholder="Enter an address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="address-button"
          onClick={handleSearch}
          disabled={cooldown || isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>
      {saved?.embedUrl && (<div>
        <p className="saved-address-label">Saved Address</p>
        <div className="saved-address-block">
          <div className="map-info-block">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
            <p className='saved-address-name'>{saved?.formatted_address}</p>
          </div>
        </div>
      </div>)}
    </div>
  )
}

export default AddressLookup
