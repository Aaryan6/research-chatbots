"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Wrench, Navigation2 } from "lucide-react";

interface RepairShop {
  name: string;
  distance: string;
  address: string;
  estimatedRepairTime: string;
  repairTypes: string;
}

export default function RepairShopCards({
  repairShops,
}: {
  repairShops: RepairShop[];
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {repairShops.map((shop, index) => (
        <Card
          key={index}
          className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{shop.name}</h3>
                <Badge variant="secondary" className="text-xs font-normal">
                  <Navigation2 className="w-3 h-3 mr-1" />
                  {shop.distance}
                </Badge>
              </div>

              <div className="grid gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span>{shop.address}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>{shop.estimatedRepairTime}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wrench className="w-3 h-3 text-primary" />
                  <span>{shop.repairTypes}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
