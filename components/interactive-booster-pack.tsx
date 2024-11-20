"use client"

import { useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Stars } from 'lucide-react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Rarity = 1 | 2 | 3 | 4
type CardType = 'Monster' | 'Spell' | 'Trap'

interface CardData {
  id: number
  name: string
  description: string
  rarity: Rarity
  type: CardType
  drawnDate: string
}

interface BoosterState {
  stage: 'closed' | 'opening' | 'revealing' | 'collection'
  currentCardIndex: number
  isFlipped: boolean
  cards: CardData[]
  collection: CardData[]
  sortBy: 'rarity' | 'drawnDate' | 'name' | 'type'
  setStage: (stage: BoosterState['stage']) => void
  setCurrentCardIndex: (index: number) => void
  setIsFlipped: (isFlipped: boolean) => void
  setCards: (cards: CardData[]) => void
  addToCollection: (cards: CardData[]) => void
  setSortBy: (sortBy: BoosterState['sortBy']) => void
}

const useBoosterStore = create<BoosterState>()(
  persist(
    (set) => ({
      stage: 'closed',
      currentCardIndex: 0,
      isFlipped: false,
      cards: [],
      collection: [],
      sortBy: 'drawnDate',
      setStage: (stage) => set({ stage }),
      setCurrentCardIndex: (index) => set({ currentCardIndex: index }),
      setIsFlipped: (isFlipped) => set({ isFlipped }),
      setCards: (cards) => set({ cards }),
      addToCollection: (cards) => set((state) => ({ collection: [...state.collection, ...cards] })),
      setSortBy: (sortBy) => set({ sortBy }),
    }),
    {
      name: 'booster-storage',
    }
  )
)

const rarityConfig = {
  1: { label: 'Common', color: 'bg-gray-500', icon: Star },
  2: { label: 'Uncommon', color: 'bg-green-500', icon: Star },
  3: { label: 'Rare', color: 'bg-blue-500', icon: Stars },
  4: { label: 'Extremely Rare', color: 'bg-purple-500', icon: Stars },
}

const cardTypes: CardType[] = ['Monster', 'Spell', 'Trap']
const totalCards = 6

function generateRandomCards(count: number): CardData[] {
  const fantasyNames = [
    "Aethoria", "Zephyria", "Lumina", "Drakonir", "Sylvanna",
    "Mystral", "Eldrin", "Faewyn", "Thorne", "Celestia",
    "Roran", "Nymira", "Kaelor", "Elowen", "Azura"
  ];
  const descriptions = [
    "A guardian of the enchanted forest, wielding nature's magic.",
    "A celestial being, bringing light to the darkest corners of the realm.",
    "A shapeshifter, master of illusions and trickery.",
    "A wise sage, keeper of ancient knowledge and forgotten spells.",
    "A brave knight, defender of the weak and protector of the realm.",
    "A mischievous fairy, spreading joy and chaos in equal measure.",
    "A powerful sorcerer, harnessing the elements to their will.",
    "A mystical beast, last of its kind, with untold magical abilities.",
    "A time-bending wizard, able to glimpse both past and future.",
    "A nature spirit, embodiment of the seasons and guardian of balance."
  ];
  return Array.from({ length: count }, (_, index) => ({
    id: (Math.floor(Math.random() * 9000) + 1000), // This generates a random 4-digit number
    name: fantasyNames[Math.floor(Math.random() * fantasyNames.length)],
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    rarity: (Math.floor(Math.random() * 4) + 1) as Rarity,
    type: cardTypes[Math.floor(Math.random() * cardTypes.length)],
    drawnDate: new Date().toISOString(),
  }));
}

export function InteractiveBoosterPackComponent() {
  const {
    stage,
    currentCardIndex,
    isFlipped,
    cards,
    collection,
    sortBy,
    setStage,
    setCurrentCardIndex,
    setIsFlipped,
    setCards,
    addToCollection,
    setSortBy,
  } = useBoosterStore()

  useEffect(() => {
    // This effect is now only for any side effects that need to run on mount
    // State persistence is handled by Zustand's persist middleware
  }, [])

  const handleOpenBooster = () => {
    setStage('opening')
    setCards(generateRandomCards(totalCards))
    setTimeout(() => setStage('revealing'), 1500) // Increased animation time
  }

  const handleCardClick = () => {
    if (!isFlipped) {
      setIsFlipped(true)
    } else if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    } else {
      addToCollection(cards)
      setStage('collection')
      setCurrentCardIndex(0)
      setIsFlipped(false)
    }
  }

  const currentCard = cards[currentCardIndex]

  const sortedCollection = [...collection].sort((a, b) => {
    switch (sortBy) {
      case 'rarity':
        return b.rarity - a.rarity
      case 'drawnDate':
        return new Date(b.drawnDate).getTime() - new Date(a.drawnDate).getTime()
      case 'name':
        return a.name.localeCompare(b.name)
      case 'type':
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })

  const CardDisplay = ({ card }: { card: CardData }) => (
    <div className="w-full h-full bg-white rounded-lg flex flex-col p-2">
      <div className="h-2/3 bg-gray-200 rounded-t-lg mb-2 relative">
        {/* Placeholder for portrait */}
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          Portrait
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
          {card.name} - {card.type}
        </div>
      </div>
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-bold text-gray-800">{card.name}</h3>
        <Badge variant="secondary">{card.type}</Badge>
      </div>
      <p className="text-xs text-gray-600 mb-2 flex-grow overflow-y-auto">
        {card.description}
      </p>
      <div className="flex justify-between items-end text-xs">
        <div 
          className={`flex items-center justify-center ${rarityConfig[card.rarity].color} text-white rounded-full px-2 py-1`}
          aria-label={`Rarity: ${rarityConfig[card.rarity].label}`}
        >
          {rarityConfig[card.rarity].icon === Star ? (
            <Star className="w-3 h-3 mr-1" />
          ) : (
            <Stars className="w-3 h-3 mr-1" />
          )}
          <span className="font-semibold">{rarityConfig[card.rarity].label}</span>
        </div>
        <span className="text-gray-500 sr-only">
          {new Date(card.drawnDate).toLocaleDateString()}
        </span>
        <span className="text-gray-500">#{card.id}</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-blue-900 p-4">
      <AnimatePresence mode="wait">
        {stage === 'closed' && (
          <motion.div
            key="booster"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <motion.div 
              className="relative w-64 h-96 mb-8 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/placeholder.svg?height=384&width=256"
                alt="Shiny Booster Pack"
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/30 to-purple-500/30 rounded-lg"></div>
              <div className="absolute inset-0 bg-white/10 rounded-lg backdrop-blur-[1px]"></div>
            </motion.div>
            <Button 
              onClick={handleOpenBooster}
              className="px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              Open Booster
            </Button>
          </motion.div>
        )}

        {stage === 'opening' && (
          <motion.div
            key="opening"
            initial={{ opacity: 0, scale: 1, rotate: 0 }}
            animate={{ opacity: 1, scale: 0, rotate: 720 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-64 h-96 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg flex items-center justify-center"
          >
            <span className="text-4xl font-bold text-white">Opening...</span>
          </motion.div>
        )}

        {stage === 'revealing' && currentCard && (
          <motion.div
            key="card-reveal"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card
              className="w-64 h-96 cursor-pointer perspective"
              onClick={handleCardClick}
            >
              <motion.div
                className="relative w-full h-full"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute w-full h-full backface-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">?</span>
                  </div>
                </div>
                <div className="absolute w-full h-full backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                  <CardDisplay card={currentCard} />
                </div>
              </motion.div>
            </Card>
            <p className="text-white text-lg mt-4">
              {isFlipped
                ? currentCardIndex < totalCards - 1
                  ? "Click to see next card"
                  : "Click to finish"
                : "Click to reveal card"}
            </p>
            <p className="text-white text-lg mt-2">
              Card {currentCardIndex + 1} of {totalCards}
            </p>
          </motion.div>
        )}

        {stage === 'collection' && (
          <motion.div
            key="collection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Your Collection</h2>
            <div className="mb-4 flex justify-between items-center">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as BoosterState['sortBy'])}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rarity">Rarity</SelectItem>
                  <SelectItem value="drawnDate">Date Drawn</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-white">Total Cards: {collection.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedCollection.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="w-full aspect-[3/4] hover:shadow-lg transition-shadow duration-300">
                    <CardDisplay card={card} />
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button 
                onClick={() => setStage('closed')}
                className="px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 ease-in-out"
              >
                Open Another Pack
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}