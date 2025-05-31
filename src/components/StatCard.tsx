import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  link: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor, link }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className={`${bgColor} h-2`}></div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
          <div className="p-2 rounded-full bg-gray-100">
            {icon}
          </div>
        </div>
        <Link to={link} className="mt-3 inline-flex items-center text-sm text-primary hover:text-primary-dark">
          <span>View Details</span>
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default StatCard;