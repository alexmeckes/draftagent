import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/index';
import { analyzePlayer } from '../store/draftSlice';

interface AnalysisPanelProps {
  selectedPlayer: any;
  draftId: string;
  isMyTurn: boolean;
  currentPick?: number;
}

export default function AnalysisPanel({ selectedPlayer, draftId, isMyTurn, currentPick }: AnalysisPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { analysis, isAnalyzing } = useSelector((state: RootState) => state.draft);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents'>('overview');

  const handleAnalyze = () => {
    if (selectedPlayer && draftId) {
      dispatch(analyzePlayer({ draftId, playerId: selectedPlayer.player_id }));
    }
  };

  if (!selectedPlayer) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">Select a player to analyze</p>
          <p className="text-sm">Click on any player in the pool to see AI recommendations</p>
        </div>
      </div>
    );
  }

  const agentIcons = {
    valueAgent: '💰',
    teamCompositionAgent: '🏗️',
    scarcityAgent: '📊',
    riskAgent: '⚠️'
  };

  return (
    <div className="h-full flex flex-col">
      {/* Player Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {selectedPlayer.first_name} {selectedPlayer.last_name}
            </h2>
            <p className="text-gray-400">
              {selectedPlayer.position} - {selectedPlayer.team || 'Free Agent'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              #{selectedPlayer.search_rank || '???'}
            </div>
            <p className="text-sm text-gray-400">Overall Rank</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Age:</span>
            <span className="ml-2 font-semibold">{selectedPlayer.age}</span>
          </div>
          <div>
            <span className="text-gray-400">Experience:</span>
            <span className="ml-2 font-semibold">{selectedPlayer.years_exp} yrs</span>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <span className="ml-2 font-semibold">{selectedPlayer.status}</span>
          </div>
          <div>
            <span className="text-gray-400">Pick:</span>
            <span className="ml-2 font-semibold">#{currentPick}</span>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="mt-4 w-full py-2 bg-primary hover:bg-purple-700 disabled:bg-gray-700 rounded-lg transition-colors font-semibold"
        >
          {isAnalyzing ? 'Analyzing...' : 'Get AI Analysis'}
        </button>
      </div>

      {/* Analysis Content */}
      <div className="flex-1 overflow-y-auto">
        {!analysis ? (
          <div className="p-6 text-center text-gray-400">
            <p>Click "Get AI Analysis" to see recommendations</p>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'agents'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Agent Analysis
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
              <div className="p-6">
                {/* Master Recommendation */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Master Recommendation</h3>
                  <div className={`p-4 rounded-lg ${
                    analysis.verdict === 'DRAFT' ? 'bg-success/20' : 'bg-warning/20'
                  }`}>
                    <p className="text-lg leading-relaxed">{analysis.recommendation}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`font-bold text-xl ${
                        analysis.verdict === 'DRAFT' ? 'text-success' : 'text-warning'
                      }`}>
                        {analysis.verdict}
                      </span>
                      <span className="text-sm text-gray-400">
                        Confidence: {analysis.confidence}/10
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-2">Value Score</h4>
                    <div className="text-2xl font-bold text-primary">
                      {analysis.agents?.valueAgent?.valueScore}/10
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-2">Team Need</h4>
                    <div className="text-2xl font-bold text-success">
                      {analysis.agents?.teamCompositionAgent?.needScore}/10
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-2">Scarcity</h4>
                    <div className="text-2xl font-bold text-warning">
                      {analysis.agents?.scarcityAgent?.urgency}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-2">Risk Level</h4>
                    <div className="text-2xl font-bold text-danger">
                      {analysis.agents?.riskAgent?.riskScore}/10
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {isMyTurn && (
                  <button className="mt-6 w-full py-3 bg-success hover:bg-green-600 rounded-lg font-semibold text-lg">
                    Draft This Player
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Individual Agent Cards */}
                {Object.entries(analysis.agents || {}).map(([agentKey, agentData]: [string, any]) => (
                  <div key={agentKey} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <span className="mr-2">{agentIcons[agentKey as keyof typeof agentIcons]}</span>
                      {agentKey.replace(/([A-Z])/g, ' $1').replace('Agent', '').trim()}
                    </h4>
                    <p className="text-sm text-gray-300 mb-2">{agentData.analysis}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(agentData).map(([key, value]) => {
                        if (key === 'analysis') return null;
                        return (
                          <div key={key}>
                            <span className="text-gray-400">{key}:</span>
                            <span className="ml-1 font-semibold">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}