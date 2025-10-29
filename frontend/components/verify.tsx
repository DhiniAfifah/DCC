"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useLanguage } from "@/context/LanguageContext"
import { ShieldCheck, User, Clock, Hash, Download } from "lucide-react"

export function Verify({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const { t } = useLanguage();

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center pb-6">
                    <div className="relative inline-block mx-auto mt-4 mb-6">
                        <div className="absolute inset-0 bg-green-100 rounded-full scale-150" />
                        <ShieldCheck className="relative text-green-600 w-12 h-12" />
                    </div>
                    <CardTitle className="text-2xl">{t("verification")}</CardTitle>
                    <CardDescription>{t("this_page")}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-7 px-6 pb-6">
                    <div className="space-y-3">
                        <InfoRow 
                            label={t("sertifikat")} 
                            value="DCC-00123-2025"
                            icon={<Hash className="w-5 h-5" />}
                        />
                        <InfoRow 
                            label={t("signer_name")} 
                            value="Direktur"
                            icon={<User className="w-5 h-5" />}
                        />
                        <InfoRow 
                            label={t("timestamp")} 
                            value="2025-10-29 14:35:20"
                            icon={<Clock className="w-5 h-5" />}
                        />
                    </div>

                    <div className="flex justify-center">
                        <Button 
                            variant="blue"
                            className="shadow-lg hover:shadow-xl"
                        >
                            <Download className="mr-1 h-5 w-5" /> 
                            {t("download")} DCC
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function InfoRow({
    label,
    value,
    icon,
}: {
    label: string
    value: string
    icon?: React.ReactNode
}) {
    return (
        <div className="flex flex-row items-center gap-4 p-4 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/50 hover:to-muted/70 transition-all duration-200 hover:shadow-sm">
            {icon && (
                <div className="text-muted-foreground">
                    {icon}
                </div>
            )}
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase">{label}</span>
                <span className="font-semibold">{value}</span>
            </div>
        </div>
    )
}