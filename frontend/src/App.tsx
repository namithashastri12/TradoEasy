import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { DemoBanner } from './components/DemoBanner';
import { SummaryCards } from './components/SummaryCards';
import { FilterBar } from './components/FilterBar';
import { ScannerTable } from './components/ScannerTable';
import { UniverseSelectorModal } from './components/UniverseSelectorModal';
import { ClearNotesModal } from './components/ClearNotesModal';
import { AlertModal } from './components/AlertModal';
import { AlertToast } from './components/AlertToast';
import { FyersAuthModal } from './components/FyersAuthModal';
import { useMarketWebSocket } from './hooks/useMarketWebSocket';
import { useSRObservations, useFilterPersistence } from './hooks/useLocalStorage';
import { Universe, FilterState } from './types/market';
import { FALLBACK_UNIVERSES, FALLBACK_SECTORS } from './utils/demoDataFallback';

const DEFAULT_FILTER: FilterState = {
  universeId: 'nifty_500',
  volume: 'ALL',
  priceChange: 'ALL',
  sector: 'ALL',
  relativeVolume: 'ALL',
  searchQuery: '',
};

export function App() {
  const [universes, setUniverses] = useState<Universe[]>(FALLBACK_UNIVERSES);
  const [sectorsList, setSectorsList] = useState<string[]>(FALLBACK_SECTORS);
  
  // Sticky filter state that persists across page reloads & 1-minute auto-refresh cycles
  const [filters, setFilters] = useFilterPersistence(DEFAULT_FILTER);

  // Modals visibility
  const [isUniverseModalOpen, setIsUniverseModalOpen] = useState(false);
  const [isClearNotesModalOpen, setIsClearNotesModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isFyersModalOpen, setIsFyersModalOpen] = useState(false);

  // Support / Resistance observations (persisted in localStorage)
  const { observations, updateSR, clearAllNotes } = useSRObservations();

  // Load universes & sectors catalog on initial mount
  useEffect(() => {
    fetch('/api/universes')
      .then((res) => res.json())
      .then((data) => {
        if (data.universes) setUniverses(data.universes);
        if (data.sectors) setSectorsList(data.sectors);
      })
      .catch((err) => console.warn('Could not fetch universes catalog:', err));
  }, []);

  // Real-time market WebSocket connection
  const {
    ticksList,
    summary,
    marketStatus,
    mode,
    setMode,
    connectionState,
    isStale,
    secondsSinceLastUpdate,
    lastUpdateTimestamp,
    changeUniverse,
    requestSnapshot,
    recentAlerts,
    dismissAlert,
  } = useMarketWebSocket(filters.universeId);

  // Handle universe change
  const handleSelectUniverse = useCallback((universeId: string) => {
    setFilters((prev) => ({ ...prev, universeId }));
    changeUniverse(universeId);
  }, [changeUniverse, setFilters]);

  // Reset all filters except universe
  const handleResetFilters = useCallback(() => {
    setFilters((prev) => ({
      ...DEFAULT_FILTER,
      universeId: prev.universeId,
    }));
  }, [setFilters]);

  // Active Universe display name
  const activeUniverseName = useMemo(() => {
    const found = universes.find((u) => u.id === filters.universeId);
    return found ? found.name : 'NIFTY 500';
  }, [universes, filters.universeId]);

  // Combined real-time multi-parameter filtering
  const filteredTicks = useMemo(() => {
    const search = filters.searchQuery.trim().toLowerCase();

    return ticksList.filter((tick) => {
      // 1. Search filter (matches ticker, symbol, or company name)
      if (search) {
        const matchTicker = tick.ticker.toLowerCase().includes(search);
        const matchSymbol = tick.symbol.toLowerCase().includes(search);
        const matchName = tick.company_name.toLowerCase().includes(search);
        if (!matchTicker && !matchSymbol && !matchName) return false;
      }

      // 2. Sector filter
      if (filters.sector !== 'ALL') {
        if (tick.sector.toLowerCase() !== filters.sector.toLowerCase()) return false;
      }

      // 3. Relative Volume filter
      if (filters.relativeVolume !== 'ALL') {
        if (filters.relativeVolume === '1X' && tick.relative_volume < 1.0) return false;
        if (filters.relativeVolume === '1.5X' && tick.relative_volume < 1.5) return false;
        if (filters.relativeVolume === '2X' && tick.relative_volume < 2.0) return false;
        if (filters.relativeVolume === '3X' && tick.relative_volume < 3.0) return false;
      }

      // 4. Volume filter
      if (filters.volume !== 'ALL') {
        if (filters.volume === 'ABOVE_AVERAGE' && tick.today_volume <= tick.avg_volume) return false;
        if (filters.volume === 'BELOW_AVERAGE' && tick.today_volume >= tick.avg_volume) return false;
        if (filters.volume === 'HIGH_VOLUME' && tick.today_volume < (tick.avg_volume * 1.5)) return false;
      }

      // 5. Price change filter
      if (filters.priceChange !== 'ALL') {
        if (filters.priceChange === 'POSITIVE' && tick.change <= 0) return false;
        if (filters.priceChange === 'NEGATIVE' && tick.change >= 0) return false;
        if (filters.priceChange === '1%' && tick.change_percent < 1.0) return false;
        if (filters.priceChange === '2%' && tick.change_percent < 2.0) return false;
        if (filters.priceChange === '<-1%' && tick.change_percent > -1.0) return false;
        if (filters.priceChange === '<-2%' && tick.change_percent > -2.0) return false;
      }

      return true;
    });
  }, [ticksList, filters]);

  const savedNotesCount = Object.keys(observations).filter(
    (k) => observations[k]?.support || observations[k]?.resistance
  ).length;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Demo Banner if running in demo mode */}
      <DemoBanner mode={mode} onOpenFyersModal={() => setIsFyersModalOpen(true)} />

      {/* Terminal Header */}
      <Header
        marketStatus={marketStatus}
        connectionState={connectionState}
        mode={mode}
        isStale={isStale}
        secondsSinceLastUpdate={secondsSinceLastUpdate}
        lastUpdateTimestamp={lastUpdateTimestamp}
        onRefresh={requestSnapshot}
        onOpenClearNotes={() => setIsClearNotesModalOpen(true)}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        onOpenFyersModal={() => setIsFyersModalOpen(true)}
        savedNotesCount={savedNotesCount}
      />

      {/* Main Terminal Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 py-4 flex flex-col">
        
        {/* Top Summary Metrics Cards */}
        <SummaryCards summary={summary} activeUniverseName={activeUniverseName} />

        {/* Multi-Parameter Filter Bar (Preserved during 1-min auto refresh) */}
        <FilterBar
          filter={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          onOpenUniverseModal={() => setIsUniverseModalOpen(true)}
          activeUniverseName={activeUniverseName}
          sectorsList={sectorsList}
          totalMatches={filteredTicks.length}
        />

        {/* Real-time Scanner Table */}
        <ScannerTable
          ticks={filteredTicks}
          observations={observations}
          onUpdateSR={updateSR}
        />

      </main>

      {/* Footer Info */}
      <footer className="border-t border-[#1E263C] bg-[#0E131F] py-2.5 px-4 text-center text-slate-500 text-[11px] font-mono">
        tradoeasy · Real-Time Market Intelligence Terminal · Indian Equities (NSE 200) · Auto-refreshes state every 1 min without resetting filters.
      </footer>

      {/* Modals & Toasts */}
      <UniverseSelectorModal
        isOpen={isUniverseModalOpen}
        onClose={() => setIsUniverseModalOpen(false)}
        universes={universes}
        currentUniverseId={filters.universeId}
        onSelectUniverse={handleSelectUniverse}
      />

      <ClearNotesModal
        isOpen={isClearNotesModalOpen}
        onClose={() => setIsClearNotesModalOpen(false)}
        onConfirm={clearAllNotes}
        count={savedNotesCount}
      />

      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        availableTicks={ticksList}
      />

      <FyersAuthModal
        isOpen={isFyersModalOpen}
        onClose={() => setIsFyersModalOpen(false)}
        currentMode={mode}
        onModeChange={setMode}
      />

      <AlertToast alerts={recentAlerts} onDismiss={dismissAlert} />

    </div>
  );
}

export default App;
