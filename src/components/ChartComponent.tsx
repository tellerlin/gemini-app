import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ComposedChart, ScatterChart, Scatter
} from 'recharts';
import { Download, BarChart3, PieChart as PieChartIcon, TrendingUp, Activity, FileDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChartComponentProps {
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'composed' | 'scatter';
  data: any[];
  config: {
    xAxis?: string;
    yAxis?: string;
    series?: Array<{
      name: string;
      dataKey: string;
      color?: string;
      type?: 'line' | 'bar' | 'area';
    }>;
    title?: string;
    height?: number;
    width?: number;
  };
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'
];

export function ChartComponent({ type, data, config }: ChartComponentProps) {
  const [chartType, setChartType] = useState(type);

  const downloadChart = (format: 'svg' | 'pdf' = 'svg') => {
    const filename = encodeURIComponent(config.title || 'chart');
    
    if (format === 'svg') {
      const svgElement = document.querySelector('.recharts-wrapper svg') as SVGElement;
      if (!svgElement) {
        toast.error('Chart not found');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `${filename}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
      
      toast.success('Chart downloaded as SVG');
    } else if (format === 'pdf') {
      const chartContainer = document.querySelector('.recharts-wrapper')?.parentElement as HTMLElement;
      if (!chartContainer) {
        toast.error('Chart container not found');
        return;
      }

      html2canvas(chartContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape');
        const imgWidth = 280;
        const pageHeight = 200;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${filename}.pdf`);
        toast.success('Chart downloaded as PDF');
      }).catch(error => {
        console.error('Error generating PDF:', error);
        toast.error('Failed to generate PDF');
      });
    }
  };

  const renderChart = () => {
    const commonProps = {
      data,
      width: config.width || 600,
      height: config.height || 400,
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
            <p className="font-medium text-gray-900">{`${label}`}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value}`}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {config.series?.map((series, index) => (
              <Line
                key={series.name}
                type="monotone"
                dataKey={series.dataKey}
                stroke={series.color || COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {config.series?.map((series, index) => (
              <Bar
                key={series.name}
                dataKey={series.dataKey}
                fill={series.color || COLORS[index % COLORS.length]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey={config.series?.[0]?.dataKey || 'value'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {config.series?.map((series, index) => (
              <Area
                key={series.name}
                type="monotone"
                dataKey={series.dataKey}
                stroke={series.color || COLORS[index % COLORS.length]}
                fill={series.color || COLORS[index % COLORS.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );

      case 'radar':
        return (
          <RadarChart width={500} height={400} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xAxis} />
            <PolarRadiusAxis />
            <Radar
              name={config.series?.[0]?.name || 'Value'}
              dataKey={config.series?.[0]?.dataKey || 'value'}
              stroke={COLORS[0]}
              fill={COLORS[0]}
              fillOpacity={0.3}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RadarChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {config.series?.map((series, index) => {
              const color = series.color || COLORS[index % COLORS.length];
              switch (series.type) {
                case 'bar':
                  return <Bar key={series.name} dataKey={series.dataKey} fill={color} />;
                case 'area':
                  return (
                    <Area
                      key={series.name}
                      type="monotone"
                      dataKey={series.dataKey}
                      stroke={color}
                      fill={color}
                      fillOpacity={0.3}
                    />
                  );
                default:
                  return (
                    <Line
                      key={series.name}
                      type="monotone"
                      dataKey={series.dataKey}
                      stroke={color}
                      strokeWidth={2}
                    />
                  );
              }
            })}
          </ComposedChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {config.series?.map((series, index) => (
              <Scatter
                key={series.name}
                dataKey={series.dataKey}
                fill={series.color || COLORS[index % COLORS.length]}
              />
            ))}
          </ScatterChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const chartTypes = [
    { key: 'line', icon: TrendingUp, label: 'Line' },
    { key: 'bar', icon: BarChart3, label: 'Bar' },
    { key: 'pie', icon: PieChartIcon, label: 'Pie' },
    { key: 'area', icon: Activity, label: 'Area' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {config.title || 'Data Chart'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {data.length} data points
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg p-1">
            {chartTypes.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setChartType(key as any)}
                className={`p-2 rounded-md transition-colors ${
                  chartType === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => downloadChart('svg')}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span>SVG</span>
            </button>
            <button
              onClick={() => downloadChart('pdf')}
              className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <FileDown className="h-4 w-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 overflow-auto">
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={config.height || 400}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Preview */}
      {data.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-700 hover:text-gray-900 font-medium">
              View Data ({data.length} rows)
            </summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    {Object.keys(data[0]).map(key => (
                      <th key={key} className="text-left py-1 px-2 font-medium text-gray-600">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="py-1 px-2 text-gray-700">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing first 5 of {data.length} rows
                </p>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
} 