"use client";

import Importer from "@/components/importer";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CreateDCC() {
  const [formData, setFormData] = useState({
    xml: null,
  })

  const handleSubmit = async () => {

  }
  
  return (
    <div className="container mx-auto py-8 pt-20">
      <div className="mt-12 space-y-10">
        <Importer formData={formData} />
        
      </div>
      <div className="flex justify-end max-w-4xl mx-auto px-4 mt-8">
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  )
}