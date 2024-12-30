import React, { useState, useEffect } from 'react';
import { goals } from './goals';

const RoadmapTracker = () => {
  const [completedGoals, setCompletedGoals] = useState(() => {
    const saved = localStorage.getItem('completedGoals');
    return new Set(saved ? JSON.parse(saved) : []);
  });
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [viewingAllPeriods, setViewingAllPeriods] = useState(false);

  useEffect(() => {
    localStorage.setItem('completedGoals', JSON.stringify([...completedGoals]));
  }, [completedGoals]);

  const areas = {
    "Academic": { color: "bg-blue-500", letter: "A", textColor: "text-blue-700", hoverColor: "hover:bg-blue-600" },
    "Business": { color: "bg-green-500", letter: "B", textColor: "text-green-700", hoverColor: "hover:bg-green-600" },
    "Technical": { color: "bg-purple-500", letter: "T", textColor: "text-purple-700", hoverColor: "hover:bg-purple-600" },
    "Networking": { color: "bg-orange-500", letter: "N", textColor: "text-orange-700", hoverColor: "hover:bg-orange-600" }
  };

  const calculateTimeProgress = () => {
    const now = new Date();
    const startDate = new Date('2025-01-01');
    const sixMonthMark = new Date('2025-06-30');
    const yearMark = new Date('2025-12-31');
    const eighteenMonthMark = new Date('2026-06-30');

    if (now < sixMonthMark) {
      const progress = (now - startDate) / (sixMonthMark - startDate);
      return { phase: 6, progress: Math.min(Math.max(progress * 100, 0), 100) };
    } else if (now < yearMark) {
      const progress = (now - sixMonthMark) / (yearMark - sixMonthMark);
      return { phase: 12, progress: Math.min(Math.max(progress * 100, 0), 100) };
    } else if (now < eighteenMonthMark) {
      const progress = (now - yearMark) / (eighteenMonthMark - yearMark);
      return { phase: 18, progress: Math.min(Math.max(progress * 100, 0), 100) };
    }
    return { phase: 18, progress: 100 };
  };

  const calculateProgress = (month, area = null) => {
    let relevantGoals = {
      muggle: [],
      monk: [],
      god: []
    };

    if (viewingAllPeriods && area) {
      // Calculate progress across all periods for the selected area
      [6, 12, 18].forEach(period => {
        ['muggle', 'monk', 'god'].forEach(difficulty => {
          relevantGoals[difficulty] = [
            ...relevantGoals[difficulty],
            ...goals[period][difficulty].filter(g => g.area === area)
          ];
        });
      });
    } else {
      // Original calculation for single period
      ['muggle', 'monk', 'god'].forEach(difficulty => {
        if (area) {
          relevantGoals[difficulty] = goals[month][difficulty].filter(g => g.area === area);
        } else {
          relevantGoals[difficulty] = goals[month][difficulty];
        }
      });
    }

    const muggleComplete = relevantGoals.muggle.filter(goal => completedGoals.has(goal.id)).length;
    const monkComplete = relevantGoals.monk.filter(goal => completedGoals.has(goal.id)).length;
    const godComplete = relevantGoals.god.filter(goal => completedGoals.has(goal.id)).length;

    let totalProgress = 0;

    if (relevantGoals.muggle.length > 0) {
      totalProgress += (muggleComplete / relevantGoals.muggle.length) * 100;
    }
    if (relevantGoals.monk.length > 0) {
      totalProgress += (monkComplete / relevantGoals.monk.length) * 100;
    }
    if (relevantGoals.god.length > 0) {
      totalProgress += (godComplete / relevantGoals.god.length) * 100;
    }

    return Math.round(totalProgress);
  };

  const handleGoalToggle = (goalId) => {
    setCompletedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleTimelineClick = (month) => {
    setViewingAllPeriods(false);
    if (selectedMonth === month && !selectedArea) {
      setSelectedMonth(null);
    } else {
      setSelectedMonth(month);
      setSelectedArea(null);
    }
  };

  const handleBubbleClick = (month, area) => {
    setViewingAllPeriods(false);
    if (selectedMonth === month && selectedArea === area) {
      setSelectedMonth(null);
      setSelectedArea(null);
    } else {
      setSelectedMonth(month);
      setSelectedArea(area);
    }
  };

  const handleAreaLabelClick = (area) => {
    if (selectedArea === area && viewingAllPeriods) {
      setSelectedArea(null);
      setViewingAllPeriods(false);
    } else {
      setSelectedArea(area);
      setSelectedMonth(null);
      setViewingAllPeriods(true);
    }
  };

  const getAllPeriodsGoals = (area) => {
    const allGoals = {};
    [6, 12, 18].forEach(period => {
      ["muggle", "monk", "god"].forEach(difficulty => {
        if (!allGoals[difficulty]) allGoals[difficulty] = [];
        allGoals[difficulty] = [
          ...allGoals[difficulty],
          ...goals[period][difficulty]
            .filter(g => g.area === area)
            .map(g => ({ ...g, period }))
        ];
      });
    });
    return allGoals;
  };

  const timeProgress = calculateTimeProgress();

  const TimelineProgress = () => (
    <div className="mt-8 mb-4 px-4 md:px-8">
      <div className="relative">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${timeProgress.progress}%` }}
          />
        </div>

        {[6, 12, 18].map(month => (
          <div
            key={month}
            className={`absolute cursor-pointer transform -translate-x-1/2 ${
              selectedMonth === month ? 'font-bold' : ''
            }`}
            style={{
              left: `${(month / 18) * 100}%`,
              top: '-0.5rem'
            }}
            onClick={() => handleTimelineClick(month)}
          >
            <div className="h-4 w-1 bg-gray-400 mb-1"></div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {month} months
              <div className="text-xs mt-1">
                {calculateProgress(month)}% done
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600 mt-8 md:mt-16 text-center">
        Current phase: {timeProgress.phase} months ({Math.round(timeProgress.progress)}% complete)
      </div>
    </div>
  );

  const GoalsPanel = () => {
    if (!selectedMonth && !viewingAllPeriods) return (
      <div className="w-full h-64 md:h-full flex items-center justify-center text-gray-500">
        Select a timeline point or area to view goals
      </div>
    );

    const displayGoals = viewingAllPeriods ? getAllPeriodsGoals(selectedArea) : goals[selectedMonth];

    return (
      <div className="p-4 md:p-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-800">
            {viewingAllPeriods
              ? `All ${selectedArea} Goals`
              : selectedArea
                ? `${selectedArea} Goals - Month ${selectedMonth}`
                : `Month ${selectedMonth} Goals`}
          </h3>
          <div className="text-sm text-gray-600">
            Progress: {viewingAllPeriods
              ? calculateProgress(null, selectedArea)
              : calculateProgress(selectedMonth, selectedArea)}%
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {["muggle", "monk", "god"].map(difficulty => (
            <div key={difficulty} className="border rounded-lg p-3 md:p-4 bg-white shadow-sm">
              <h4 className="font-semibold mb-3 md:mb-4 capitalize text-gray-800">{difficulty} Mode</h4>
              <div className="space-y-2">
                {displayGoals[difficulty]
                  .filter(goal => !selectedArea || goal.area === selectedArea)
                  .map(goal => (
                    <div
                      key={goal.id}
                      className="flex items-start gap-2 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer"
                      onClick={() => handleGoalToggle(goal.id)}
                    >
                      <div className="bg-gray-100 rounded">
                        <input
                          type="checkbox"
                          checked={completedGoals.has(goal.id)}
                          onChange={() => handleGoalToggle(goal.id)}
                          className="mt-1 mx-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <span className={`flex items-center gap-2 text-sm ${areas[goal.area].textColor}`}>
                        <span className={`inline-block flex-shrink-0 w-6 h-6 rounded-full ${areas[goal.area].color} text-white text-center leading-6`}>
                          {areas[goal.area].letter}
                        </span>
                        {viewingAllPeriods ? `[Month ${goal.period}] ${goal.text}` : goal.text}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Timeline Panel */}
      <div className="w-full md:w-2/3 p-4 md:p-8 border-b md:border-b-0 md:border-r">
        <h2 className="text-xl md:text-2xl mt-8 md:mt-32 font-bold mb-8 text-gray-800">18-Month Strategic Roadmap</h2>

        <div className="relative">
          {/* Bubbles */}
          <div className="h-72 relative">
            {Object.entries(areas).map(([area, info], areaIndex) => (
              <React.Fragment key={area}>
                {/* Area labels */}
                <div
                  className={`absolute left-0 text-sm font-medium cursor-pointer
                    ${selectedArea === area && viewingAllPeriods ? 'text-gray-800 font-bold' : 'text-gray-600'}
                    hover:text-gray-800 transition-colors`}
                  style={{ top: 34 + areaIndex * 60 }}
                  onClick={() => handleAreaLabelClick(area)}
                >
                  {area}
                </div>

                {/* Bubbles for each time period */}
                {[6, 12, 18].map(month => (
                  <div
                    key={`${area}-${month}`}
                    className={`absolute w-10 md:w-12 h-10 md:h-12 rounded-full ${info.color} cursor-pointer
                      transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110
                      flex items-center justify-center text-white font-bold ${info.hoverColor}
                      ${selectedMonth === month && selectedArea === area ? 'ring-4 ring-offset-2' : ''}`}
                    style={{
                      left: `${(month / 18) * 92}%`,
                      top: 40 + areaIndex * 60
                    }}
                    onClick={() => handleBubbleClick(month, area)}
                  >
                    {info.letter}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Timeline Progress */}
          <TimelineProgress />
        </div>
      </div>

      {/* Goals Panel */}
      <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l bg-gray-50">
        <GoalsPanel />
      </div>
    </div>
  );
};

export default RoadmapTracker;
