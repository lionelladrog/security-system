import Link from "next/link";
import { menuItems } from "../constant/menu";
export function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0  bg-opacity-50 z-20" onClick={onClose}>
      <nav
        className="w-64 bg-white h-full shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item) => (
          <div key={item.id} className="mb-2">
            {item.url ? (
              <Link
                href={item.url}
                onClick={onClose}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <>
                <div className="flex items-center gap-2 p-2 font-semibold">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                <div className="pl-6">
                  {item.children?.map((child) =>
                    child.url ? (
                      <Link
                        href={child.url}
                        key={child.id}
                        onClick={onClose}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                      >
                        <child.icon size={16} />
                        <span>{child.label}</span>
                      </Link>
                    ) : null
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
