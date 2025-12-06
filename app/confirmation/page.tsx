import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';

export default function Confirmation() {
  return (
    <div className="min-h-screen bg-[#808080] text-white flex flex-col">
      <Navbar activePage="post" />
      
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-xl text-gray-300 mb-8">
            May you be clear of scary spirits!
          </p>
          
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              {/* Placeholder for the plant/sage image - using a simple illustration */}
              <div className="w-full h-full bg-gradient-to-b from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🌿</div>
                  <div className="text-4xl">🪴</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

