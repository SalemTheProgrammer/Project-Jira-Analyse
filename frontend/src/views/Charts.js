import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Tooltip, Legend, XAxis, YAxis, ResponsiveContainer, LabelList
} from 'recharts';

const Charts = () => {
  const [data, setData] = useState([]);
  const [averageSimilarity, setAverageSimilarity] = useState(0);
  const [mostUsedPath, setMostUsedPath] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/best_matches_bp');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        const issues = result.data || [];
        const filteredIssues = issues.filter(issue => issue.best_matches && issue.best_matches.length > 0);
        setData(filteredIssues);
        calculateAverageSimilarity(filteredIssues);
        calculateMostUsedPath(filteredIssues);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateAverageSimilarity = (issues) => {
    const totalSimilarity = issues.reduce((acc, issue) => {
      return acc + (issue.best_matches?.[0]?.similarity_score || 0);
    }, 0);
    const avgSimilarity = totalSimilarity / issues.length;
    setAverageSimilarity(avgSimilarity.toFixed(2));
  };

  const calculateMostUsedPath = (issues) => {
    const pathCount = issues.reduce((acc, issue) => {
      const path = issue.best_matches?.[0]?.path || 'No match';
      if (!acc[path]) acc[path] = 0;
      acc[path]++;
      return acc;
    }, {});
    const mostUsed = Object.entries(pathCount).reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0]);
    setMostUsedPath(mostUsed[0]);
  };

  const getBarChartData = () => {
    const countByPath = data.reduce((acc, issue) => {
      const path = issue.best_matches?.[0]?.path || 'No match';
      if (!acc[path]) acc[path] = 0;
      acc[path]++;
      return acc;
    }, {});

    return Object.entries(countByPath).map(([name, count]) => ({ name, count }));
  };

  const getLineChartData = () => {
    return data.map((issue, index) => ({
      name: `Issue ${index + 1}`,
      similarity: issue.best_matches?.[0]?.similarity_score || 0,
    }));
  };

  const getPieChartData = () => {
    const countByStatus = data.reduce((acc, issue) => {
      const status = issue.issue.Status || 'Unknown';
      if (!acc[status]) acc[status] = 0;
      acc[status]++;
      return acc;
    }, {});

    return Object.entries(countByStatus).map(([name, value]) => ({ name, value }));
  };

  const getAreaChartData = () => {
    return data.map((issue, index) => ({
      name: `Issue ${index + 1}`,
      similarity: issue.best_matches?.[0]?.similarity_score || 0,
    }));
  };

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Issue Matching Charts</h1>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Average Similarity Score</h5>
              <p className="card-text">{averageSimilarity}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Most Used Path</h5>
              <p className="card-text">{mostUsedPath}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 mb-4">
          <h4 className="text-center">Issues by Best Match Path</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getBarChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis>
                <LabelList dataKey="count" position="top" />
              </YAxis>
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8">
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6 mb-4">
          <h4 className="text-center">Similarity Scores of Issues</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getLineChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="similarity" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6 mb-4">
          <h4 className="text-center">Issues by Status</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={getPieChartData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {getPieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6 mb-4">
          <h4 className="text-center">Trend of Similarity Scores</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getAreaChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="similarity" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
