import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  HomeIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <WrenchScrewdriverIcon className="h-24 w-24 text-blue-500" />
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-white font-bold text-sm">
                404
              </span>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl md:text-5xl mb-4">
          Trang đang được phát triển
        </h1>
        
        <p className="mt-4 text-base text-gray-500 max-w-lg mx-auto sm:text-lg mb-8">
          Tính năng hoặc nội dung của trang này hiện chưa được hoàn thiện hoặc đang trong quá trình bảo trì. Vui lòng quay lại sau!
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại trang trước
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

